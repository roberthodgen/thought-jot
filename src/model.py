"""
The MIT License (MIT)

Copyright (c) 2015 Robert Hodgen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""


from google.appengine.ext import ndb

from datetime import datetime, timedelta, tzinfo

import utilities

from ndb_users import users


class UTC(tzinfo):
    """ Defines a `tzinfo` subclass for UTC/Universal Coordindated Time.
    All dates are stored in NDB without time zone information. This UTC class
    is needed so `datetime.isoformat()` includes timezone information. """

    def utcoffset(self, dt):
        return timedelta(0)

    def tzname(self, dt):
        return 'UTC'

    def dst(self, dt):
        return timedelta(0)


class Project(ndb.Model):
    """ Project """
    # The name/short description of this Project
    name = ndb.StringProperty(required=True)
    # The long description of this Project
    description = ndb.TextProperty(default=None)
    # The permalink (or web safe name, used in URLs) of this Project
    permalink = ndb.StringProperty(required=True)
    # The primary User's email address
    owner = ndb.StringProperty(required=True)
    # Other User's email address whom can contribute (create/end) Time Records
    contributors = ndb.StringProperty(repeated=True)
    # Other User's email address whom can view the Project and Time Records
    observers = ndb.StringProperty(repeated=True)
    # Holds the `owner`, every `contributors` and every `observers`;
    # Used for querying Projects to avoid massive OR queries...
    users = ndb.StringProperty(repeated=True)
    # The number of seconds this Project has recorded
    completed = ndb.FloatProperty(default=0)
    # Whether this Project should appear in a User's Projects list (not archived)
    active = ndb.BooleanProperty(required=True, default=True)
    # The current Milestone count (used for assigning new Milestone numbers)
    milestone_count = ndb.IntegerProperty(default=0)
    # Record WHEN this record was truly created and last updated
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)

    @property
    def created_utc(self):
        """ Return `created` with tzinfo set to `UTC`. """
        return self.created.replace(tzinfo=UTC())

    @property
    def updated_utc(self):
        """ Return `updated` with tzinfo set to `UTC`. """
        return self.updated.replace(tzinfo=UTC())

    @property
    def has_uncompleted_time_records(self):
        """ Run a query to see if this Project has uncompleted Time Records. """
        query = TimeRecord.query(TimeRecord.completed == None, ancestor=self.key)
        return (query.count(limit=1) > 0)

    @classmethod
    def create_project(cls, name):
        """ Create a new Project for the currently logged in user named `name`. """
        user = users.get_current_user()
        new_project = cls(
            name=name,
            permalink=utilities.permalinkify(name),
            owner=user.email,
            users=[user.email]
        )
        return new_project.put()

    def add_contributors(self, contributors):
        """ Add `contributors` to `self.contributors`.
        `contributors` is expected as an array of email address strings.
        Update `self.users` as needed. """
        for contributor in contributors:
            if contributor != self.owner:
                if contributor not in self.contributors:
                    self.contributors.append(contributor)
                if contributor not in self.users:
                    self.users.append(contributor)
                if contributor in self.observers:
                    self.observers.remove(contributor)
        return self.put()

    def remove_contributors(self, contributors):
        """ Remove `contributors` from `self.contributors`.
        `contributors` is expected to be an array of email address strings.
        Update `self.users` as needed. """
        for contributor in contributors:
            if contributor in self.contributors:
                self.contributors.remove(contributor)
                if contributor in self.users and contributor != self.owner:
                    self.users.remove(contributor)
        return self.put()

    def is_owner(self, email):
        """ Returns whether `email` is the Project's owner. """
        return email == self.owner

    def has_contributor(self, contributor):
        """ Returns whether `contributor` is a Contributor of this Project. """
        return contributor in self.contributors

    def has_observor(self, observer):
        """ Returns whether `observer` is an Observer of this Project. """
        return observer in self.observers

    def json_object(self):
        """ Return a dictionary representing this Project.
        Will be used for JSON requests! """
        return {
            'id': self.key.urlsafe(),
            'name': self.name,
            'description': self.description,
            'owner': self.owner,
            'contributors': self.contributors,
            'observers': self.observers,
            'completed': self.completed,
            'has_uncompleted_time_records': self.has_uncompleted_time_records,
            'active': self.active,
            'created': self.created_utc.isoformat(),
            'updated': self.updated_utc.isoformat()
        }


class TimeRecord(ndb.Model):
    """ Time Record """
    tags = ndb.StringProperty(repeated=True)
    # The name/short description of this Time Record
    name = ndb.StringProperty(default=None)
    # The date/time (in UTC) this Time Record was started
    start = ndb.DateTimeProperty(required=True, auto_now_add=True)
    # Store a the User's email address who (created) this Time Record
    user = ndb.StringProperty(required=True)
    # The date/time (in UTC) this Time Record was ended;
    # or None for a time Record with pre-set length!
    end = ndb.DateTimeProperty(default=None)
    # The number of seconds this Time Record counted for
    completed = ndb.FloatProperty(default=None)
    # Record WHEN this record was truly created and last updated
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)

    @classmethod
    @ndb.transactional(xg=True)
    def create_time_record(cls, project_key, user_email, name=None,
        completed=None):
        """ Create a new TimeRecord for the Project identified by
        `project_key`. """
        new_time_record = cls(
            parent=project_key,
            user=user_email
        )
        project = project_key.get()
        if completed:
            new_time_record.completed = float(completed)
            project.completed += float(completed)
        if name:
            new_time_record.name = name
        project.put()  # Update the `updated` property of our parent
        return new_time_record.put()

    @ndb.transactional(xg=True)
    def complete_time_record(self):
        """ Complete this Time Record by setting the `end` property, computing
        it's total seconds and setting this Time Record's `completed`
        property and add its seconds to it's parent Project. """
        # Only proceed if `self.completed` is None
        if not self.completed:
            # Update and record
            self.end = datetime.now()
            self.completed = (self.end - self.start).total_seconds()
            self.put()
            # Update the parent Project
            project_key = self.key.parent()
            project = project_key.get()
            project.completed += self.completed
            project.put()
        return self

    def json_object(self):
        """ Return a dictionary representing this Time Record. Will be used for
        sending information about this Time Record via JSON requests. """
        start = self.start.replace(tzinfo=UTC())
        end_string_value = None
        if self.end:
            end_string_value = self.end.replace(tzinfo=UTC()).isoformat()
        response_object = {
            'id': self.key.urlsafe(),
            'start': start.isoformat(),
            'end': end_string_value,
            'completed': self.completed,
            'created': self.created.replace(tzinfo=UTC()).isoformat(),
            'updated': self.updated.replace(tzinfo=UTC()).isoformat(),
            'name': self.name,
            'user': self.user
        }
        # Query all Comments that have this Time Record as their parent
        response_object['comment_count'] = Comment.query(
            ancestor=self.key).count(limit=10)
        return response_object


class Comment(ndb.Model):
    """ Comments left on TimeRecords or general Project comments. """
    # The content of the comment
    comment = ndb.TextProperty(required=True)
    # Store the User's email address who (created) this Comment
    user = ndb.StringProperty(required=True)
    # Store the Project to which this Comment is held
    project = ndb.KeyProperty(required=True, kind=Project)
    # Record WHEN this comment was truly created and last updated
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)

    @classmethod
    @ndb.transactional(xg=True)
    def create_comment(cls, comment, parent_key, project_key, user_email):
        """ Create a new Comment belonging to `parent_key`. """
        new_comment = cls(
            parent=parent_key,
            project=project_key,
            comment=comment,
            user=user_email
        )
        parent_key.get().put()  # Update the `updated` property of our parent
        if parent_key != project_key:
            project_key.get().put()  # Update the `updated` property of our Project
        return new_comment.put()

    def json_object(self):
        """ Return a dictionary representing this Comment. Will be used for
        sending information about this Comment via JSON requests. """
        return {
            'id': self.key.urlsafe(),
            'created': self.created.replace(tzinfo=UTC()).isoformat(),
            'updated': self.updated.replace(tzinfo=UTC()).isoformat(),
            'comment': self.comment,
            'project_id': self.project.urlsafe(),   # TODO: Phase out
            'parent_id': self.key.parent().urlsafe(),
            'user': self.user
        }


class Milestone(ndb.Model):
    """ Represents Milestones or todo-style items. """
    # The name
    name = ndb.TextProperty(required=True)
    # The long description of this Project
    description = ndb.TextProperty(default=None)
    # Open status
    open = ndb.BooleanProperty(default=True)
    # Milestone number
    number = ndb.IntegerProperty(required=True)
    # Add any Labels
    labels = ndb.KeyProperty(repeated=True)
    # Store the User's email address who (created) this Comment
    user = ndb.StringProperty(required=True)
    # Record WHEN this comment was truly created and last updated
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)

    @classmethod
    @ndb.transactional(xg=True)
    def create_milestone(cls, name, project_key, user_email):
        """ Create a new Milestone belonging to `project_key`. """
        # Fetch the Project...
        project = project_key.get()
        project.milestone_count += 1
        new_milestone = cls(
            parent=project_key,
            name=name,
            user=user_email,
            number=project.milestone_count
        )
        project = project_key.get()
        project.put()  # Update the `updated` property of our Project
        return new_milestone.put()

    @classmethod
    def for_number(cls, project_key, number):
        """ Return a Milestone object from the datastore belonging to a Project
        identified by `project_key`;
        with `number` as it's `number` property. """
        query = cls.query(cls.number == number,
            ancestor=project_key)
        return query.get()

    def json_object(self, comments=None):
        """ Return a dictionary representing this Milestone. Will be used for
        sending information about this Milestone via JSON requests. """
        response_object = {
            'id': self.number,
            'created': self.created.replace(tzinfo=UTC()).isoformat(),
            'updated': self.updated.replace(tzinfo=UTC()).isoformat(),
            'name': self.name,
            'description': self.description,
            'open': self.open,
            'user': self.user
        }
        if comments:
            # Query all Comments that have this Milestone as their parent
            comments = Comment.query(ancestor=self.key)
            response_object['comments'] = []
            response_object['comment_count'] = 0
            for comment in comments:
                response_object['comments'].append(comment.json_object())
                response_object['comment_count'] += 1
        else:
            response_object['comment_count'] = Comment.query(
                ancestor=self.key).count(limit=10)
        # Query all Labels that have this Milestone assigned
        response_object['labels'] = []
        for label_key in self.labels:
            label = label_key.get()
            if label:
                response_object['labels'].append(label.json_object())
        return response_object


class Label(ndb.Model):
    """ Represents a Label to a Milestone. """
    # The name
    name = ndb.TextProperty(required=True)
    # Background color of the label, in HEX
    color = ndb.TextProperty(indexed=False, required=True)
    # Record WHEN this comment was truly created and last updated
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)

    @classmethod
    @ndb.transactional(xg=True)
    def create_label(cls, name, color, project_key):
        """ Create a new Label under the `project_key`. """
        # Verify `color`
        new_label = cls(
            parent=project_key,
            name=name,
            color=color.lower()
        )
        return new_label.put()

    @ndb.transactional(xg=True)
    def delete_label(self):
        """ Delete this Label and remove it from any Milestone's `labels`. """
        milestones = Milestone.query(ancestor=self.key.parent())
        for milestone in milestones:
            if self.key in milestone.labels:
                milestone.labels.remove(self.key)
                milestone.put()
        return self.key.delete()

    def json_object(self):
        """ Return a dictionary representing this Label. Will be used for sending
        information about this Label via JSON requests. """
        return {
            'id': self.key.urlsafe(),
            '_id': self.key.id(),
            'created': self.created.replace(tzinfo=UTC()).isoformat(),
            'updated': self.updated.replace(tzinfo=UTC()).isoformat(),
            'name': self.name,
            'color': self.color
        }


class Account(ndb.Model):
    pass
