"""

Copyright (c) 2015 Robert Hodgen. All rights reserved.

"""


import string

import re

import google.net.proto.ProtocolBuffer

from google.appengine.ext import ndb


def permalinkify(string):
  """ Return a clean URL-friendly version of `string`. """
  clean = string.lower().strip() # lowercase, striped of whitespace
  clean = re.sub(r'\s(\s*)?', '-', clean) # Replace spaces with dashes "-"
  clean = re.sub(r'[^a-z0-9-]', '', clean) # Strip non-alphanumeric
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