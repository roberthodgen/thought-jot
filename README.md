# ThoughtJot!

Collaborative time tracker and project management tool.

### Current Limitations
- Only one Time Record may be "in-progress" (i.e. uncompleted) at a time.
- Deep linking of Issues via hashtags not implemented.
- Cannot delete Time Records.
- Cannot add fixed-length Time Records.
- Issue search does not query back-end.
- Discussion/comments section not yet implemented.
- Better Angular error handler needed (with respect to HTTP request errors).
- Make it mobile-friendly!

### Instructions to deploy

#### 1. Update `src/app.yaml`:

Modify the Project's name:


```
application: thought-jot
```

#### 2. Update `src/ndb_users/config.py`:

Modify the sender's email address:

```
NDB_USERS_EMAIL_SENDER = False  # or use a Project owner's email address.
```

or:

```
NDB_USERS_EMAIL_SENDER = 'Project-owner Name <project-owner@your-domain.com>'
```

For email requirements see: https://cloud.google.com/appengine/docs/python/mail/#Python_Sending_mail

#### 3. Update/configure Datastore indexes

```
appcfg.py update_indexes thought-jot/
```

See: https://cloud.google.com/appengine/docs/python/tools/uploadinganapp#Python_Updating_indexes

#### 4. Modify branding:

Please do not use the _ThoughtJot_ brand as it is a trademark of Robert Hodgen. Robert Hodgen does not permit or consent to any use of his trademarks in any manner that is likely to cause confusion by implying association with or sponsorship by Robert Hodgen.

----

Copyright (c) 2015 Robert Hodgen. Available under the MIT license.

ThoughtJot is a trademark of Robert Hodgen.
