from ndb_users import users

import webapp2

from google.appengine.ext import ndb

import json

import logging

from datetime import datetime, timedelta

import model


class ProjectList(webapp2.RequestHandler):
  def get(self):
    """ Return Projects this User has access to... """
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
          project.add_contributors([contributor_email])
          response_object['project'] = project.json_object()
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
          project.remove_contributors([contributor_email])
          response_object['project'] = project.json_object()
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


app = webapp2.WSGIApplication([
  webapp2.Route(
    '/api/projects.json',
    handler=ProjectList
  ), webapp2.Route(
    '/api/projects/create.json',
    handler=ProjectCreate
  ), webapp2.Route(
    '/api/projects/contributors/add.json',
    handler=ProjectContributorsAdd
  ), webapp2.Route(
    '/api/projects/contributors/remove.json',
    handler=ProjectContributorsRemove
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

app.error_handlers[401] = error_handler_unauthorized