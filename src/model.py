"""

mode.py holds out data models

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
    return timedelta(0);

  def tzname(self, dt):
    return 'UTC'

  def dst(self, dt):
    return timedelta(0)


class Project(ndb.Model):
  """ Project """

  # The name/description of this Project
  name = ndb.StringProperty(required=True)

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
  completed = ndb.FloatProperty(default=None)

  # Whether this Project should appear in a User's Projects list (not archived)
  active = ndb.BooleanProperty(required=True, default=True)

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

  @classmethod
  def create_project(cls, name):
    """ Create a new Project for the currently logged in user named `name`. """
    user = users.get_current_user()
    new_project = Project(
      name=name,
      permalink=utilities.permalinkify(name),
      owner=user.email,
      users=[user.email]
    )
    return new_project.put()

  def json_object(self):
    """ Return a dictionary representing this Project.
    Will be used for JSON requests! """
    return {
      'id': self.key.urlsafe(),
      'name': self.name,
      'permalink': self.permalink,
      'owner': self.owner,
      'contributors': self.contributors,
      'observers': self.observers,
      'completed': self.completed,
      'active': self.active,
      'created': self.created_utc.isoformat(),
      'updated': self.updated_utc.isoformat()
    }


class TimeRecord(ndb.Model):
  """ Time Record """

  tags = ndb.StringProperty(repeated=True)
  
  # The name/description of this Time Record
  name = ndb.StringProperty(default=None)

  # The date/time (in UTC) this Time Record was started
  start = ndb.DateTimeProperty(required=True, auto_now_add=True)
  
  # Store a the User's email address who (created) this Time Record
  user = ndb.StringProperty(required=True)

  # The date/time (in UTC) this Time Record was ended
  end = ndb.DateTimeProperty(default=None)
  
  # The number of seconds this Time Record counted for
  completed = ndb.FloatProperty(default=None)

  # Record WHEN this record was truly created and last updated
  created = ndb.DateTimeProperty(auto_now_add=True)
  updated = ndb.DateTimeProperty(auto_now=True)


class Account(ndb.Model):

  pass




