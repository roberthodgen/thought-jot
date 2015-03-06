"""

Copyright (c) 2015 Robert Hodgen. All rights reserved.

"""


from ndb_users import users

import webapp2

from google.appengine.ext import ndb

import json

import logging

from datetime import datetime, timedelta

import model

import re

import utilities


class Projects(webapp2.RequestHandler):
  def get(self, project_id=None):
    """ Return a list of Projects this User has access to. """
    response_object = {};
    user = users.get_current_user()
    if not user:
      self.abort(401)
    if project_id:
      project_key = utilities.key_for_urlsafe_id(project_id)
      if project_key:
        project = project_key.get()
        if project:
          response_object = project.json_object()
        else:
          self.abort(404)
      else:
        self.abort(400)
    else:
      # Query for Projects this User owns, contributes to, or may observe
      projects = model.Project.query(model.Project.users.IN([user.email]))
      response_object = [];
      for project in projects:
        response_object.append(project.json_object())
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))

  def post(self):
    """ Create a new Project for this User. """
    response_object = {};
    user = users.get_current_user()
    if not user:
      # No user
      self.abort(401)
      return None
    # Get JSON request body
    if self.request.body:
      request_object = json.loads(self.request.body)
      name = request_object.get('name')
      if name:
        new_project_key = model.Project.create_project(name)
        new_project = new_project_key.get()
        if len(request_object.keys()) > 1:
          # Process optional items...
          description = request_object.get('description')
          if description:
            new_project.description = description
          new_project.put()
        response_object = new_project.json_object()
      else:
        self.abort(400)
    else:
      self.abort(400)
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))

  def put(self, project_id):
    """ Update a Project. """
    response_object = {};
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # GET JSON request body
    if self.request.body and project_id:
      request_object = json.loads(self.request.body)
      project_key = utilities.key_for_urlsafe_id(project_id)
      project = project_key.get()
      if project:
        if user.email not in project.users:
          self.abort(401)
        # Process changes...
        name = request_object.get('name')
        if name:
          project.name = name
        description = request_object.get('description')
        if description:
          project.description = description
        active = request_object.get('active')
        if isinstance(active, bool):
          project.active = active;
        project.put()
        response_object = project.json_object()
      else:
        self.abort(404)
    else:
      self.abort(400)
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))

  def delete(self, project_id):
    """ Deletes a Project. """
    # TODO: Implement delete!
    self.abort(501)

    """ Delete this user's Project. """
    response_object = {};
    user = users.get_current_user()
    if not user:
      # No user
      self.abort(401)
      return None
    # Get JSON request body
    if self.request.body and project_id:
      request_object = json.loads(self.request.body)
      project_key_id = request_object.get('project_id')
      if project_key_id:
        project = ndb.Key(urlsafe=project_key_id).get()
        if project:
          if project.is_owner(user.email):
            project.key.delete()
            response_object['project'] = {}
          else:
            self.abort(404)
        else:
          self.abort(404)
      else:
        self.abort(400)
    else:
      self.abort(400)
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class Contributors(webapp2.RequestHandler):
  def post(self, project_id, contributor_email):
    """ Add Contributors to this Project. """
    response_object = {};
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # Get JSON request body
    if contributor_email and project_id:
      project_key = utilities.key_for_urlsafe_id(project_id)
      if project_key:
        project = project_key.get()
        if project:
          new_contributor = users.User.user_for_email(contributor_email)
          if new_contributor:
            if (project.is_owner(user.email)
              or project.has_contributor(user.email)):
              project.add_contributors([contributor_email])
              response_object = project.json_object()
            else:
              self.abort(401)
          else:
            self.abort(404)
        else:
          self.abort(404)
      else:
        self.abort(400)
    else:
      self.abort(400)
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))

  def delete(self, project_id, contributor_email):
    """ Remove Contributors from this Project. """
    response_object = {};
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # Get JSON request body
    if project_id and contributor_email:
      project_key = utilities.key_for_urlsafe_id(project_id)
      if project_key and contributor_email:
        project = project_key.get()
        new_contributor = users.User.user_for_email(contributor_email)
        if project and new_contributor:
          if (project.is_owner(user.email)
            or project.has_contributor(user.email)):
            project.remove_contributors([contributor_email])
            response_object = project.json_object()
          else:
            self.abort(401)
        else:
          self.abort(404)
      else:
        self.abort(400)
    else:
      self.abort(400)
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class TimeRecords(webapp2.RequestHandler):
  def get(self, project_id):
    """ List the Time Records associated with a Project. """
    response_object= {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    if project_id:
      project_key = utilities.key_for_urlsafe_id(project_id)
      project = project_key.get()
      if project:
        if user.email not in project.users:
            self.abort(401)
        # Query for Projects this User owns, contributes to, or may observe
        time_records = model.TimeRecord.query(ancestor=project_key)
        response_object = []
        for time_record in time_records:
          response_object.append(time_record.json_object())
      else:
        self.abort(404)
    else:
      self.abort(400)
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))

  def post(self, project_id):
    """ Create a new Time Record associated with this Project. """
    response_object = {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    if project_id:
      project_key = utilities.key_for_urlsafe_id(project_id)
      if project_key:
        project = project_key.get()
        if project:
          if ((user.email not in project.contributors)
            and (user.email != project.owner)):
            self.abort(401)
          if not project.has_uncompleted_time_records:
            new_time_record_key = model.TimeRecord.create_time_record(
              project_key, user.email)
            new_time_record = new_time_record_key.get()
            if self.request.body:
              request_object = json.loads(self.request.body)
              name = request_object.get('name')
              if name:
                new_time_record.name = name;
              new_time_record.put()
            response_object = new_time_record.json_object()
          else:
            self.abort(400)
        else:
          self.abort(404)
      else:
        self.abort(400)
    else:
      self.abort(400)
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))

  def put(self, project_id, time_record_id):
    """ Update the Time Record. """
    response_object = {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    if project_id and time_record_id and self.request.body:
      request_object = json.loads(self.request.body)
      project_key = utilities.key_for_urlsafe_id(project_id)
      time_record_key = utilities.key_for_urlsafe_id(time_record_id)
      if (project_key and time_record_key and
        (project_key == time_record_key.parent())):
        project = project_key.get()
        time_record = time_record_key.get()
        if time_record and project:
          if ((user.email not in project.contributors)
            and (user.email != project.owner)):
            self.abort(401)
          # Process optional items...
          name = request_object.get('name')
          if name:
            time_record.name = name
          end = request_object.get('end')
          if end:
            if end == True:
              time_record.complete_time_record()
          time_record.put()
          project.put()
          response_object = time_record.json_object()
        else:
          self.abort(404)
      else:
        self.abort(400)
    else:
      self.abort(400)
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class Comments(webapp2.RequestHandler):
  def get(self, project_id, parent_id=None):
    response_object = {};
    user = users.get_current_user()
    if not user:
      self.abort(401)
    if parent_id:
      # Fetch by Parent ID
      parent_key = utilities.key_for_urlsafe_id(parent_id)
      if not parent_key:
        self.abort(400)
      parent = parent_key.get()
      if not parent:
        self.abort(404)
      comments = model.Comment.query(ancestor=parent_key)
      response_object = [];
      for comment in comments:
        response_object.append(comment.json_object())
    else:
      # Rely upon Project
      if not project_id:
        self.abort(400)
      project_key = utilities.key_for_urlsafe_id(project_id)
      if not project_key:
        self.abort(400)
      project = project_key.get()
      if not project:
        self.abort(404)
      comments = model.Comment.query(ancestor=project_key)
      response_object = []
      for comment in comments:
        response_object.append(comment.json_object())
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


  def post(self, project_id, parent_id=None):
    """ Create a new Comment in the specified Project, bound to another parent
    object. """
    response_object = {};
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # Get JSON request body
    if project_id and self.request.body:
      request_object = json.loads(self.request.body)
      comment_content = request_object.get('comment')
      if not comment_content:
        self.abort(400)
      project_key = utilities.key_for_urlsafe_id(project_id)
      if project_key:
        project = project_key.get()
        if project:
          if ((user.email not in project.contributors)
            and (user.email != project.owner)):
            self.abort(401)
          if parent_id:
            parent_key = utilities.key_for_urlsafe_id(parent_id)
            if parent_key:
              parent = parent_key.get()
              if parent:
                # Create with `Project` and `Parent`
                new_comment_key = model.Comment.create_comment(
                  comment_content, parent_key, project_key, user.email)
                comment = new_comment_key.get()
                response_object = comment.json_object()
              else:
                self.abort(404)
            else:
              self.abort(400)
          else:
            # Create with `Project` as parent
            new_comment_key = model.Comment.create_comment(
              comment_content, project_key, project_key, user.email)
            comment = new_comment_key.get()
            response_object = comment.json_object()
        else:
          self.abort(404)
      else:
        self.abort(400)
    else:
      self.abort(400)
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))

  def put(self, project_id, comment_id):
    """ Update a Comment. """
    response_object = {};
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # Get JSON request body
    if not project_id or not comment_id or not self.request.body:
      self.abort(400)
    project_key = utilities.key_for_urlsafe_id(project_id)
    comment_key = utilities.key_for_urlsafe_id(comment_id)
    request_object = json.loads(self.request.body)
    comment_content = request_object.get('comment')
    if not project_key or not comment_key or not comment_content:
      self.abort(400)
    project = project_key.get()
    comment = comment_key.get()
    if not project or not comment:
      self.abort(404)
    if ((user.email not in project.contributors)
      and (user.email != project.owner)):
      self.abort(401)
    if comment.project != project_key:
      self.abort(409)
    comment.comment = comment_content
    comment.put()
    response_object = comment.json_object()
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))

  def delete(self, project_id, comment_id):
    """ Delete a Comment. """
    response_object = {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    if not project_id or not comment_id:
      self.abort(400)
    project_key = utilities.key_for_urlsafe_id(project_id)
    comment_key = utilities.key_for_urlsafe_id(comment_id)
    if not project_key or not comment_key:
      self.abort(400)
    project = project_key.get()
    comment = comment_key.get()
    if not project or not comment:
      self.abort(404)
    comment_key.delete()
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class Milestones(webapp2.RequestHandler):
  def get(self, project_id, milestone_id=None):
    """ List the Milestones associated with a Project. """
    response_object= {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    if not project_id:
      self.abort(400)
    project_key = utilities.key_for_urlsafe_id(project_id)
    if not project_key:
      self.abort(400)
    project = project_key.get()
    if not project:
      self.abort(404)
    if user.email not in project.users:
      self.abort(401)
    if milestone_id:
      # Give a specific Milestone
      milestone_key = utilities.key_for_urlsafe_id(milestone_id)
      if not milestone_key:
        self.abort(400)
      milestone = milestone_key.get()
      if not milestone:
        self.abort(404)
      response_object = milestone.json_object()
    else:
      # List all Milestones
      milestones = model.Milestone.query(ancestor=project_key)
      response_object = []
      for milestone in milestones:
        response_object.append(milestone.json_object())
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))

  def post(self, project_id):
    """ Create a new Milestone associated with this Project. """
    response_object = {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
     # Get JSON request body
    if not project_id or not self.request.body:
      self.abort(400)
    request_object = json.loads(self.request.body)
    project_key = utilities.key_for_urlsafe_id(project_id)
    name = request_object.get('name')
    if not project_key or not name:
      self.abort(400)
    project = project_key.get()
    if not project:
      self.abort(404)
    if ((user.email not in project.contributors)
      and (user.email != project.owner)):
      self.abort(401)
    new_milestone_key = model.Milestone.create_milestone(
      name, project_key, user.email)
    new_milestone = new_milestone_key.get()
    if len(request_object) > 1:
      # Process optional items...
      description = request_object.get('description')
      if description:
        new_milestone.description = description
      labels = request_object.get('labels')
      if isinstance(labels, list):
        for label_key_id in labels:
          label_key = ndb.Key(urlsafe=label_key_id)
          new_milestone.labels.append(label_key)
      new_milestone.put()
    response_object = new_milestone.json_object()
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))

  def put(self, project_id, milestone_id):
    """ Update a Milestone. """
    response_object= {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    if not project_id or not milestone_id or not self.request.body:
      self.abort(400)
    project_key = utilities.key_for_urlsafe_id(project_id)
    milestone_key = utilities.key_for_urlsafe_id(milestone_id)
    request_object = json.loads(self.request.body)
    if not project_key or not milestone_key:
      self.abort(400)
    project = project_key.get()
    milestone = milestone_key.get()
    if not project or not milestone:
      self.abort(404)
    if user.email not in project.users:
      self.abort(401)
    # Process optional items...
    if len(request_object) > 0:
      name = request_object.get('name')
      if name:
        milestone.name = name
      description = request_object.get('description')
      if description:
        milestone.description = description
      labels = request_object.get('labels')
      if isinstance(labels, list):
        for label_key_id in labels:
          label_key = ndb.Key(urlsafe=label_key_id)
          new_milestone.labels.append(label_key)
      milestone.put()
    response_object = milestone.json_object()
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))

  @ndb.transactional(xg=True)
  def delete(self, project_id, milestone_id):
    """ Delete a Milestone. """
    response_object= {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    if not project_id or not milestone_id:
      self.abort(400)
    project_key = utilities.key_for_urlsafe_id(project_id)
    milestone_key = utilities.key_for_urlsafe_id(milestone_id)
    if not project_key or not milestone_key:
      self.abort(400)
    project = project_key.get()
    milestone = milestone_key.get()
    if not project or not milestone:
      self.abort(404)
    if user.email not in project.users:
      self.abort(401)
    # Get all Comments associated with this Milestone
    comments = model.Comment.query(ancestor=milestone_key)
    for comment in comments:
      comment.key.delete()
    milestone_key.delete()
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class Labels(webapp2.RequestHandler):
  def get(self, project_id, milestone_id=None):
    """ List the Labels associated with this Project. """
    response_array = []
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # Try getting the associated Project
    project_key = utilities.key_for_urlsafe_id(project_id)
    project = project_key.get()
    if not project:
      self.abort(404)
    if user.email not in project.users:
        self.abort(401)
    if milestone_id:
      # Return all Labels assigned to this Milestone
      milestone_key = utilities.key_for_urlsafe_id(milestone_id)
      if not milestone_key:
        self.abort(400)
      milestone = milestone_key.get()
      if not milestone or not isinstance(milestone, model.Milestone):
        self.abort(404)
      label_keys = milestone.labels
      for label_key in label_keys:
        label = label_key.get()
        if label:
          response_array.append(label.json_object())
    else:
      # Query for Projects this User owns, contributes to, or may observe
      labels = model.Label.query(ancestor=project.key)
      for label in labels:
        response_array.append(label.json_object())
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_array))

  def post(self, project_id, milestone_id=None):
    """ creates a Label associated with this Project. """
    response_object = {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # Try getting the associated Project
    project_key = utilities.key_for_urlsafe_id(project_id)
    project = project_key.get()
    if not project or not self.request.body:
      self.abort(400)
    request_object = json.loads(self.request.body)
    label_id = request_object.get('label_id')
    if milestone_id and label_id:
      # Add an existing Label to a Milestone
      milestone_key = utilities.key_for_urlsafe_id(milestone_id)
      label_key = utilities.key_for_urlsafe_id(label_id)
      if not milestone_key or not label_key:
        self.abort(400)
      milestone = milestone_key.get()
      label = label_key.get()
      if not milestone or not label:
        self.abort(404)
      milestone.labels.append(label.key)
      milestone.put()
      response_object = label.json_object()
    else:
      # Create a new Label
      
      name = request_object.get('name')
      color = request_object.get('color')
      if not name or not color:
        self.abort(400)
      color_pattern = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
      if not re.match(color_pattern, color):
        self.abort(400)
      if ((user.email not in project.contributors)
        and (user.email != project.owner)):
        self.abort(401)
      new_label = model.Label.create_label(name, color, project.key)
      new_label = new_label.get()
      response_object = new_label.json_object()
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))

  def delete(self, project_id, label_id, milestone_id=None,):
    """ Deletes a Label associated with this Project. """
    response_object = {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # Try getting the associated Label...
    if not project_id or not label_id:
      self.abort(400)
    project_key = utilities.key_for_urlsafe_id(project_id)
    label_key = utilities.key_for_urlsafe_id(label_id)
    if not project_key or not label_key:
      self.abort(400)
    project = project_key.get()
    label = label_key.get()
    if (not (project and isinstance(project, model.Project))
      or not (label and isinstance(label, model.Project))
      or (project.key != label.key.parent())):
      self.abort(404)
    if ((user.email not in project.contributors)
      and (user.email != project.owner)):
      self.abort(401)
    if milestone_id:
      # Delete a label only from a Milestone's `labels` array
      milestone_key = utilities.key_for_urlsafe_id(milestone_id)
      if not milestone_key:
        self.abort(400)
      milestone = milestone_key.get()
      if (not (milestone and isinstance(milestone, model.Milestone))
        or (project.key != label.key.parent())):
        self.abort(404)
      if label_key in milestone.labels:
        milestone.labels.remove(label_key)
        milestone.put()
    else:
      # Delete an entire label
      label.delete_label()
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


app = webapp2.WSGIApplication([
  webapp2.Route(
    '/api/v2/projects',
    handler=Projects,
    methods=['GET', 'POST']
  ),webapp2.Route(
    '/api/v2/projects/<project_id:([a-zA-Z0-9-_]+)>',
    handler=Projects,
    methods=['GET', 'PUT', 'DELETE']
  ), webapp2.Route(
    '/api/v2/projects/<project_id:([a-zA-Z0-9-_]+)>/contributors/<contributor_email>',
    handler=Contributors,
    methods=['POST', 'DELETE']
  ), webapp2.Route(
    '/api/v2/projects/<project_id:([a-zA-Z0-9-_]+)>/time-records',
    handler=TimeRecords,
    methods=['GET', 'POST']
  ), webapp2.Route(
    '/api/v2/projects/<project_id:([a-zA-Z0-9-_]+)>/time-records/<time_record_id:([a-zA-Z0-9-_]+)>',
    handler=TimeRecords,
    methods=['GET', 'PUT', 'DELETE']
  ), webapp2.Route(
    '/api/v2/projects/<project_id:([a-zA-Z0-9-_]+)>/<:(time-records|milestones)>/<parent_id:([a-zA-Z0-9-_]+)>/comments',
    handler=Comments,
    methods=['GET', 'POST']
  ), webapp2.Route(
    '/api/v2/projects/<project_id:([a-zA-Z0-9-_]+)>/comments',
    handler=Comments,
    methods=['GET', 'POST']
  ), webapp2.Route(
    '/api/v2/projects/<project_id:([a-zA-Z0-9-_]+)>/comments/<comment_id:([a-zA-Z0-9-_]+)>',
    handler=Comments,
    methods=['PUT', 'DELETE']
  ), webapp2.Route(
    '/api/v2/projects/<project_id:([a-zA-Z0-9-_]+)>/milestones',
    handler=Milestones,
    methods=['GET', 'POST']
  ), webapp2.Route(
    '/api/v2/projects/<project_id:([a-zA-Z0-9-_]+)>/milestones/<milestone_id:([a-zA-Z0-9-_]+)>',
    handler=Milestones,
    methods=['GET', 'PUT', 'DELETE']
  ), webapp2.Route(
    '/api/v2/projects/<project_id:([a-zA-Z0-9-_]+)>/labels',
    handler=Labels,
    methods=['GET', 'POST']
  ), webapp2.Route(
    '/api/v2/projects/<project_id:([a-zA-Z0-9-_]+)>/labels/<label_id:([a-zA-Z0-9-_]+)>',
    handler=Labels,
    methods=['PUT', 'DELETE']
  ), webapp2.Route(
    '/api/v2/projects/<project_id:([a-zA-Z0-9-_]+)>/milestones/<milestone_id:([a-zA-Z0-9-_]+)>/labels',
    handler=Labels,
    methods=['GET', 'POST']
  ), webapp2.Route(
    '/api/v2/projects/<project_id:([a-zA-Z0-9-_]+)>/milestones/<milestone_id:([a-zA-Z0-9-_]+)>/labels/<label_id:([a-zA-Z0-9-_]+)>',
    handler=Labels,
    methods=['DELETE']
  )
])


def error_handler_unauthorized(request, response, exception):
  """ HTTP/1.1 401 Unauthorized """
  logging.exception(exception)
  response.content_type = 'application/json'
  response.set_status(401)
  response.write(json.dumps({
    'status': 401,
    'message': 'HTTP/1.1 401 Unauthorized'
  }))

def error_handler_server_error(request, response, exception):
  """ HTTP/1.1 500 Internal Server Error """
  logging.exception(exception)
  response.content_type = 'application/json'
  response.set_status(500)
  response.write(json.dumps({
    'status': 500,
    'message': 'HTTP/1.1 500 Internal Server Error'
  }))


app.error_handlers[401] = error_handler_unauthorized
app.error_handlers[500] = error_handler_server_error