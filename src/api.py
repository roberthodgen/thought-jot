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


class ProjectList(webapp2.RequestHandler):
  def get(self):
    """ Return Projects this User has access to. """
    response_object = {};
    user = users.get_current_user()
    if not user:
      # No user
      self.abort(401)
      return None
    # Query for Projects this User owns, contributes to, or may observe
    projects = model.Project.query(model.Project.users.IN([user.email]))
    response_object['projects'] = []
    for project in projects:
      response_object['projects'].append(project.json_object())
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class ProjectCreate(webapp2.RequestHandler):
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
        response_object['project'] = new_project.json_object()
      else:
        self.response.set_status(400)
        response_object['missing'] = { 'post_body_json': { 'name': True }}
    else:
      self.response.set_status(400)
      response_object['missing'] =  {'post_body_json': True}
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class ProjectUpdate(webapp2.RequestHandler):
  def post(self):
    """ Update a Project. """
    response_object = {};
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # GET JSON request body
    if self.request.body:
      request_object = json.loads(self.request.body)
      project_key_id = request_object.get('project_id')
      if project_key_id:
        project_key = ndb.Key(urlsafe=project_key_id)
        project = project_key.get()
        if project:
          if user.email not in project.users:
            self.abort(401)
          if len(request_object.keys()) > 1:
            # Process optional items...
            name = request_object.get('name')
            if name:
              project.name = name
            description = request_object.get('description')
            if description:
              project.description = description
            project.put()
          response_object['project'] = project.json_object()
        else:
          self.response.set_status(404)
          response_object['not_found'] = {
            'project': not bool(project)
          }
      else:
        self.response.set_status(400)
        response_object['missing'] = {
          'post_body_json': {
            'project_id': True
          }
        }
    else:
      self.response.set_status(400)
      response_object['missing'] = {
        'post_body_json': True
      }
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class ProjectDelete(webapp2.RequestHandler):
  def post(self):
    """ Delete this user's Project. """
    response_object = {};
    user = users.get_current_user()
    if not user:
      # No user
      self.abort(401)
      return None
    # Get JSON request body
    if self.request.body:
      request_object = json.loads(self.request.body)
      project_key_id = request_object.get('project_id')
      if project_key_id:
        project = ndb.Key(urlsafe=project_key_id).get()
        if project:
          if project.is_owner(user.email):
            project.key.delete()
            response_object['project'] = {}
          else:
            self.abort(401)
        else:
          self.response.set_status(404)
          response_object['not_found'] = {
            'project': not bool(project)
          }
      else:
        self.response.set_status(400)
        response_object['missing'] = {
          'post_body_json': {
            'project_id': True
        }}
    else:
      self.response.set_status(400)
      response_object['missing'] =  {'post_body_json': True}
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class ProjectContributorsAdd(webapp2.RequestHandler):
  def post(self):
    """ Add Contributors to this Project. """
    response_object = {};
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # Get JSON request body
    if self.request.body:
      request_object = json.loads(self.request.body)
      project_key_id = request_object.get('project_id')
      contributor_email = request_object.get('contributor_email')
      if project_key_id and contributor_email:
        project = ndb.Key(urlsafe=project_key_id).get()
        new_contributor = users.User.user_for_email(contributor_email)
        if project and new_contributor:
          if (project.is_owner(user.email)
            or project.has_contributor(user.email)):
            project.add_contributors([contributor_email])
            response_object['project'] = project.json_object()
          else:
            self.abort(401)
        else:
          self.response.set_status(404)
          response_object['not_found'] = {
            'project': not bool(project),
            'new_contributor': not bool(new_contributor)
          }
      else:
        self.response.set_status(400)
        response_object['missing'] = {
          'post_body_json': {
            'project_id': not bool(project_key_id),
            'contributor_email': not bool(contributor_email)
        }}
    else:
      self.response.set_status(400)
      response_object['missing'] = { 'post_body_json': True }
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class ProjectContributorsRemove(webapp2.RequestHandler):
  def post(self):
    """ Remove Contributors from this Project. """
    response_object = {};
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # Get JSON request body
    if self.request.body:
      request_object = json.loads(self.request.body)
      project_key_id = request_object.get('project_id')
      contributor_email = request_object.get('contributor_email')
      if project_key_id and contributor_email:
        project = ndb.Key(urlsafe=project_key_id).get()
        new_contributor = users.User.user_for_email(contributor_email)
        if project and new_contributor:
          if (project.is_owner(user.email)
            or project.has_contributor(user.email)):
            project.remove_contributors([contributor_email])
            response_object['project'] = project.json_object()
          else:
            self.abort(401)
        else:
          self.response.set_status(404)
          response_object['not_found'] = {
            'project': not bool(project),
            'new_contributor': not bool(new_contributor)
          }
      else:
        self.response.set_status(400)
        response_object['missing'] = {
          'post_body_json': {
            'project_id': not bool(project_key_id),
            'contributor_email': not bool(contributor_email)
        }}
    else:
      self.response.set_status(400)
      response_object['missing'] = { 'post_body_json': True }
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class TimeRecordsList(webapp2.RequestHandler):
  def get(self):
    """ List the Time Records associated with a Project. """
    response_object= {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    project_key_id = self.request.GET.get('project_id')
    if project_key_id:
      project_key = ndb.Key(urlsafe=project_key_id)
      project = project_key.get()
      if project:
        if user.email not in project.users:
            self.abort(401)
        response_object['project'] = project.json_object()
        # Query for Projects this User owns, contributes to, or may observe
        time_records = model.TimeRecord.query(ancestor=project_key)
        response_object['time_records'] = []
        for time_record in time_records:
          response_object['time_records'].append(time_record.json_object())
      else:
        self.response.set_status(404)
        response_object['not_found'] = {
          'project': not bool(project)
        }
    else:
      self.response.set_status(400)
      response_object['missing'] = {
        'get': {
          'project_id': not bool(project_key_id)
        }
      }
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class TimeRecordCreate(webapp2.RequestHandler):
  def post(self):
    """ Create a new Time Record associated with this Project. """
    response_object = {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
     # Get JSON request body
    if self.request.body:
      request_object = json.loads(self.request.body)
      project_key_id = request_object.get('project_id')
      if project_key_id:
        project_key = ndb.Key(urlsafe=project_key_id)
        project = project_key.get()
        if project:
          if ((user.email not in project.contributors)
            and (user.email != project.owner)):
            self.abort(401)
          if not project.has_uncompleted_time_records:
            new_time_record_key = model.TimeRecord.create_time_record(
              project_key, user.email)
            new_time_record = new_time_record_key.get()
            response_object['time_record'] = new_time_record.json_object()
            response_object['project'] = project_key.get().json_object()
          else:
            self.response.set_status(400)
            response_object['error'] = {
              'project': {
                'has_uncompleted_time_records': True
            }}
        else:
          self.response.set_status(404)
          response_object['not_found'] = {
            'project': not bool(project)
          }
      else:
        self.response.set_status(400)
        response_object['missing'] = {
          'post_body_json': {
            'project_id': True
        }}
    else:
      self.response.set_status(400)
      response_object['missing'] =  {
        'post_body_json': True
      }
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class TimeRecordComplete(webapp2.RequestHandler):
  def post(self):
    """ Complete the Time Record. """
    response_object = {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # GET JSON request body
    if self.request.body:
      request_object = json.loads(self.request.body)
      time_record_key_id = request_object.get('time_record_id')
      if time_record_key_id:
        time_record_key = ndb.Key(urlsafe=time_record_key_id)
        time_record = time_record_key.get()
        if time_record:
          project = time_record.key.parent().get()
          if ((user.email not in project.contributors)
            and (user.email != project.owner)):
            self.abort(401)
          time_record.complete_time_record()
          if len(request_object.keys()) > 1:
            # Process optional items...
            name = request_object.get('name')
            if name:
              time_record.name = name
            time_record.put()
          response_object['time_record'] = time_record.json_object()
          project = time_record.key.parent().get() # Get again
          response_object['project'] = project.json_object()
        else:
          self.response.set_status(404)
          response_object['not_found'] = {
            'time_record': not bool(time_record)
          }
      else:
        self.response.set_status(400)
        response_object['missing'] = {
          'post_body_json': {
            'time_record_id': True
        }}
    else:
      self.response.set_status(400)
      response_object['missing'] =  {
        'post_body_json': True
      }
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class TimeRecordUpdate(webapp2.RequestHandler):
  def post(self):
    """ Update the Time Record. """
    response_object = {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # GET JSON request body
    if self.request.body:
      request_object = json.loads(self.request.body)
      time_record_key_id = request_object.get('time_record_id')
      if time_record_key_id:
        time_record_key = ndb.Key(urlsafe=time_record_key_id)
        time_record = time_record_key.get()
        if time_record:
          project = time_record.key.parent().get()
          if ((user.email not in project.contributors)
            and (user.email != project.owner)):
            self.abort(401)
          if len(request_object.keys()) > 1:
            # Process optional items...
            name = request_object.get('name')
            if name:
              time_record.name = name
            time_record.put()
            project.put()
          response_object['time_record'] = time_record.json_object()
          # project = time_record.key.parent().get()
          response_object['project'] = project.json_object()
        else:
          self.response.set_status(404)
          response_object['not_found'] = {
            'time_record': not bool(time_record)
          }
      else:
        self.response.set_status(400)
        response_object['missing'] = {
          'post_body_json': {
            'time_record_id': True
        }}
    else:
      self.response.set_status(400)
      response_object['missing'] = {
        'post_body_json': True
      }
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class CommentCreate(webapp2.RequestHandler):
  def post(self):
    """ Create a new Comment in the specified Project, bound to another parent
    object. """
    response_object = {};
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # Get JSON request body
    if self.request.body:
      request_object = json.loads(self.request.body)
      project_key_id = request_object.get('project_id')
      parent_key_id = request_object.get('parent_id')
      comment_content = request_object.get('comment')
      if project_key_id and parent_key_id and comment_content:
        project_key = ndb.Key(urlsafe=project_key_id)
        project = project_key.get()
        if ((user.email not in project.contributors)
          and (user.email != project.owner)):
          self.abort(401)
        parent_key = ndb.Key(urlsafe=parent_key_id)
        parent = parent_key.get()
        if project and parent:
          new_comment_key = model.Comment.create_comment(
            comment_content, parent_key, project_key, user.email)
          response_object['comment'] = new_comment_key.get().json_object()
        else:
          self.response.set_status(404)
          response_object['not_found'] = {
            'project': not bool(project),
            'parent': not bool(parent)
          }
      else:
        self.response.set_status(400)
        response_object['missing'] = {
          'post_body_json': {
            'project_id': not bool(project_key_id),
            'parent_id': not bool(parent_key_id),
            'comment': not bool(comment_content)
        }}
    else:
      self.response.set_status(400)
      response_object['missing'] =  {
        'post_body_json': True
      }
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class MilestonesList(webapp2.RequestHandler):
  def get(self):
    """ List the Milestones associated with a Project. """
    response_object= {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    project_key_id = self.request.GET.get('project_id')
    if project_key_id:
      project_key = ndb.Key(urlsafe=project_key_id)
      project = project_key.get()
      if project:
        if user.email not in project.users:
            self.abort(401)
        response_object['project'] = project.json_object()
        # Query for Projects this User owns, contributes to, or may observe
        milestones = model.Milestone.query(ancestor=project_key)
        response_object['milestones'] = []
        for milestone in milestones:
          response_object['milestones'].append(milestone.json_object())
      else:
        self.response.set_status(404)
        response_object['not_found'] = {
          'project': not bool(project)
        }
    else:
      self.response.set_status(400)
      response_object['missing'] = {
        'get': {
          'project_id': not bool(project_key_id)
        }
      }
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class MilestonesCreate(webapp2.RequestHandler):
  def post(self):
    """ Create a new Milestone associated with this Project. """
    response_object = {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
     # Get JSON request body
    if self.request.body:
      request_object = json.loads(self.request.body)
      project_key_id = request_object.get('project_id')
      name = request_object.get('name')
      if project_key_id and name:
        project_key = ndb.Key(urlsafe=project_key_id)
        project = project_key.get()
        if project:
          if ((user.email not in project.contributors)
            and (user.email != project.owner)):
            self.abort(401)
          new_milestone_key = model.Milestone.create_milestone(
            name, project_key, user.email)
          new_milestone = new_milestone_key.get()
          if len(request_object) > 2:
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
          response_object['milestone'] = new_milestone.json_object()
          response_object['project'] = project_key.get().json_object()
        else:
          self.response.set_status(404)
          response_object['not_found'] = {
            'project': not bool(project)
          }
      else:
        self.response.set_status(400)
        response_object['missing'] = {
          'post_body_json': {
            'project_id': not bool(project_key_id),
            'name': not bool(name)
        }}
    else:
      self.response.set_status(400)
      response_object['missing'] =  {
        'post_body_json': True
      }
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class MilestonesUpdate(webapp2.RequestHandler):
  def post(self):
    """ Update a Milestone in the Project. """
    response_object = {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # GET JSON request body
    if self.request.body:
      request_object = json.loads(self.request.body)
      milestone_key_id = request_object.get('milestone_id')
      if milestone_key_id:
        milestone_key = ndb.Key(urlsafe=milestone_key_id)
        milestone = milestone_key.get()
        if milestone:
          project = milestone.key.parent().get()
          if ((user.email not in project.contributors)
            and (user.email != project.owner)):
            self.abort(401)
          if len(request_object.keys()) > 1:
            # Process optional items...
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
            project.put()
          response_object['milestone'] = milestone.json_object()
          # project = milestone.key.parent().get()
          response_object['project'] = project.json_object()
        else:
          self.response.set_status(404)
          response_object['not_found'] = {
            'milestone': not bool(milestone)
          }
      else:
        self.response.set_status(400)
        response_object['missing'] = {
          'post_body_json': {
            'time_record_id': True
        }}
    else:
      self.response.set_status(400)
      response_object['missing'] = {
        'post_body_json': True
      }
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class LabelsList(webapp2.RequestHandler):
  def get(self):
    """ List the Labels associated with this Project. """
    response_object= {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    project_key_id = self.request.GET.get('project_id')
    if project_key_id:
      project_key = ndb.Key(urlsafe=project_key_id)
      project = project_key.get()
      if project:
        if user.email not in project.users:
            self.abort(401)
        response_object['project'] = project.json_object()
        # Query for Projects this User owns, contributes to, or may observe
        labels = model.Label.query(ancestor=project_key)
        response_object['labels'] = []
        for label in labels:
          response_object['labels'].append(label.json_object())
      else:
        self.response.set_status(404)
        response_object['not_found'] = {
          'project': not bool(project)
        }
    else:
      self.response.set_status(400)
      response_object['missing'] = {
        'get': {
          'project_id': not bool(project_key_id)
        }
      }
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class LabelsCreate(webapp2.RequestHandler):
  def post(self):
    """ Creates a Label associated with this Project. """
    response_object = {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
     # Get JSON request body
    if self.request.body:
      request_object = json.loads(self.request.body)
      project_key_id = request_object.get('project_id')
      name = request_object.get('name')
      color = request_object.get('color')
      if project_key_id and name and color:
        color_pattern = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
        if re.match(color_pattern, color):
          project_key = ndb.Key(urlsafe=project_key_id)
          project = project_key.get()
          if project:
            if ((user.email not in project.contributors)
              and (user.email != project.owner)):
              self.abort(401)
            new_label = model.Label.create_label(name, color, project_key)
            new_label = new_label.get()
            response_object['label'] = new_label.json_object()
            response_object['project'] = project_key.get().json_object()
          else:
            self.response.set_status(404)
            response_object['not_found'] = {
              'project': not bool(project)
            }
        else:
          self.response.set_status(400)
          response_object['error'] = {
            'post_body_json': {
              'color': 'Invalid value.'
            }
          }
      else:
        self.response.set_status(400)
        response_object['missing'] = {
          'post_body_json': {
            'project_id': not bool(project_key_id),
            'name': not bool(name),
            'color': not bool(color)
        }}
    else:
      self.response.set_status(400)
      response_object['missing'] =  {
        'post_body_json': True
      }
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


class Labels(webapp2.RequestHandler):
  def post(self, project_id):
    """ creates a Label associated with this Project. """
    response_object = {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # Try getting the associated Project
    project_key = utilities.key_for_urlsafe_id(project_id)
    project = project_key.get()
    if not project:
      self.abort(404)
    # Get JSON request body
    if self.request.body:
      request_object = json.loads(self.request.body)
      name = request_object.get('name')
      color = request_object.get('color')
      if name and color:
        color_pattern = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
        if re.match(color_pattern, color):
          if ((user.email not in project.contributors)
            and (user.email != project.owner)):
            self.abort(401)
          new_label = model.Label.create_label(name, color, project.key)
          new_label = new_label.get()
          response_object = new_label.json_object()
        else:
          self.response.set_status(400)
          response_object['error'] = {
            'post_body_json': {
              'color': 'Invalid value.'
            }
          }
      else:
        self.response.set_status(400)
        response_object['missing'] = {
          'post_body_json': {
            'name': not bool(name),
            'color': not bool(color)
        }}
    else:
      self.response.set_status(400)
      response_object['missing'] =  {
        'post_body_json': True
      }
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))

  def get(self, project_id):
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
    # Query for Projects this User owns, contributes to, or may observe
    labels = model.Label.query(ancestor=project.key)
    for label in labels:
      response_array.append(label.json_object())
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_array))

  def delete(self, project_id, label_id):
    """ Deletes a Label associated with this Project. """
    response_object = {}
    user = users.get_current_user()
    if not user:
      self.abort(401)
    # Try getting the associated Label...
    label_key = utilities.key_for_urlsafe_id(label_id)
    label = label_key.get()
    if not label:
      self.abort(404)
    project_key = label_key.parent()
    project = project_key.get()
    if not project:
      self.abort(404)
    if ((user.email not in project.contributors)
      and (user.email != project.owner)):
      self.abort(401)
    label.delete_label()
    # Send response
    self.response.content_type = 'application/json'
    self.response.out.write(json.dumps(response_object))


app = webapp2.WSGIApplication([
  webapp2.Route(
    '/api/projects/list.json',
    handler=ProjectList
  ), webapp2.Route(
    '/api/projects/create.json',
    handler=ProjectCreate
  ), webapp2.Route(
    '/api/projects/delete.json',
    handler=ProjectDelete
  ), webapp2.Route(
    '/api/projects/update.json',
    handler=ProjectUpdate
  ), webapp2.Route(
    '/api/projects/contributors/add.json',
    handler=ProjectContributorsAdd
  ), webapp2.Route(
    '/api/projects/contributors/remove.json',
    handler=ProjectContributorsRemove
  ), webapp2.Route(
    '/api/projects/time-records/list.json',
    handler=TimeRecordsList
  ), webapp2.Route(
    '/api/projects/time-records/create.json',
    handler=TimeRecordCreate
  ), webapp2.Route(
    '/api/projects/time-records/complete.json',
    handler=TimeRecordComplete
  ), webapp2.Route(
    '/api/projects/time-records/update.json',
    handler=TimeRecordUpdate
  ), webapp2.Route(
    '/api/projects/comments/create.json',
    handler=CommentCreate
  ), webapp2.Route(
    '/api/projects/milestones/list.json',
    handler=MilestonesList
  ), webapp2.Route(
    '/api/projects/milestones/create.json',
    handler=MilestonesCreate
  ), webapp2.Route(
    '/api/projects/milestones/update.json',
    handler=MilestonesUpdate
  ), webapp2.Route(
    '/api/projects/labels/list.json',
    handler=LabelsList
  ), webapp2.Route(
    '/api/projects/labels/create.json',
    handler=LabelsCreate

    ## Alternate API points
  ), webapp2.Route(
    '/api/projects/<project_id:([a-zA-Z0-9-_]+)>/labels',
    handler=Labels,
    methods=['GET', 'POST']
  ), webapp2.Route(
    '/api/projects/<project_id:([a-zA-Z0-9-_]+)>/labels/<label_id:([a-zA-Z0-9-_]+)>',
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