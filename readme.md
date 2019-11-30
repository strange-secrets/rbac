# Role based Access Control
This module provides a simple [role-based access control](https://en.wikipedia.org/wiki/Role-based_access_control)
implementation for use by client and server code.

Each user is assigned a role that determines what they can and can't do within an
application. The application describes each role to the module and then queries the
RBAC for authorization when performing actions on the users behalf.

# Installation
To make use of this module, install it with npm using:
```
npm install --save @strangesecrets/rbac
```
# Usage
Once installed to your project, you may create a simple role:
```ecmascript 6
import Rbac from '@strangesecrets/rbac';

const role = Rbac.createRole('my_role');
```
Once created, we may obtain the role using the get method:
```ecmascript 6
const role = Rbac.get('my_role');
```
####  Resources
A resource describes a point where access can be managed, conceptually it could be a file or the entire file system. Simply put
it is a 'resource' that may be accessed by a user. Each resource contains several permissions that may or may not be granted
to a particular role. If a role is granted a permission, then it may perform the related action.

If a resource contains no permissions at all, then it is considered to have administrative access and gains all permissions.

For example, given a role, we add two resources. The first grants two permission 'read' and 'write', whilst the second creates
a resource with administrative access:
```ecmascript 6
role.allow('file_system', ['read', 'write']);
role.allow('project', 'edit');
role.allow('display');
```
We can determine whether or not a role has certain permissions by using the checkPermission method. If a role was created
with administrative access it will return true for all permission checks. We may also supply an array of permissions, in
this case the checkPermission call will only return true if the role contains all of the specified permissions.

```ecmascript 6
role.checkPermission('file_system', 'read'); // True
role.checkPermission('file_system', ['read', 'write']); // True
role.checkPermission('file_system', ['read', 'write', 'edit']); // False

role.checkPermission('project', 'read'); // False
role.checkPermission('project', 'edit'); // True

role.checkPermission('display', ['read', 'write']); // True
role.checkPermission('display', 'edit'); // True
```
Because the 'file_system' resource was not created with administrative privileges, if we now deny the read and write permissions
the entire resource is removed.
```ecmascript 6
role.deny('file_system', ['read', 'write']);
role.checkPermission('file_system', 'read'); // False
```
# Building
Unit tests are provided for the module, automated builds should run the unit tests prior to uploading a new revision to
the repository store with the command:
```
npm test
```
