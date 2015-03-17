"""

Copyright (c) 2015 Robert Hodgen. All rights reserved.

"""


from ndb_users import users

import string

import re

import google.net.proto.ProtocolBuffer

from google.appengine.ext import ndb

from google.appengine.api import mail


def permalinkify(string):
    """ Return a clean URL-friendly version of `string`. """
    clean = string.lower().strip()  # lowercase, striped of whitespace
    clean = re.sub(r'\s(\s*)?', '-', clean)  # Replace spaces with dashes "-"
    clean = re.sub(r'[^a-z0-9-]', '', clean)  # Strip non-alphanumeric
    return clean


def key_for_urlsafe_id(key_id):
    """ Try returning an NDB Key for `key_id`. None otherwise. """
    key = None
    try:
        key = ndb.Key(urlsafe=key_id)
    except google.net.proto.ProtocolBuffer.ProtocolBufferDecodeError, e:
        return key
    finally:
        return key


def send_project_contributor_email(email_address, user, project):
    """ Send `email` an email notifying them they've been added as a contributor
    on `project`. """
    sender_email_address = users._email_sender()
    subject = ''.join([project.name, ' invite'])
    with open('resource/email/project_contributor.txt', 'r') as f:
        body_text = f.read()
    body_text = body_text.format(login='http://thought-jot.appspot.com/login',
        from_email=user.email, to_email=email_address,
        project_name=project.name)
    mail.send_mail(sender_email_address, email_address, subject, body_text)


def str_to_bool(string, allow_none=False):
    """ Return a Boolean value for `string`. """
    if allow_none and string is None:
        return None
    if string == 'True' or string == 'true':
        return True
    else:
        return False
