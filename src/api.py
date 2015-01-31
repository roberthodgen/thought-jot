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
        response_object['missing'] = {'post_body_json': {'name':True}}
    else:
      self.response.set_status(400)
      response_object['missing'] = {'post_body_json': True}
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