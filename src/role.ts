import Resource, {PermissionTypes} from './resource';

export default class Role {
    public readonly id: string;
    private resources: Map<string, Resource>;
    public _isAdmin: boolean;

    constructor(id: string) {
        if (!id || typeof id !== 'string') {
            throw new Error('Cannot create role with invalid identifier');
        }

        this.id = id;
        this._isAdmin = false;
        this.resources = new Map<string, Resource>();
    }

    /**
     * Creates a new Role object that is
     * @param id
     */
    static createAdmin(id: string): Role {
        const role = new Role(id);
        role._isAdmin = true;
        return role;
    }

    /**
     * Determines whether or not the Role object contains a reference the specified resource.
     * @param {string} id - Identifier of the resource to be looked for within the role.
     * @returns {boolean} True if the specified resource can be found within the role otherwise false.
     */
    has(id: string): boolean {
        return !!this.resources.has(id);
    }

    /**
     * Determines whether or not the role should be considered administrative.
     */
    get isAdmin(): boolean {
        return this._isAdmin;
    }

    /**
     *
     * @param resourceId
     * @param permissions
     */
    allow(resourceId: string, permissions: PermissionTypes) {
        if (!resourceId || typeof resourceId !== 'string') {
            throw new Error('Cannot allow resource with invalid identifier');
        }

        if (!permissions) {
            throw new Error('No permissions specified');
        }

        if (!this.isAdmin) {
            let resource = this.resources.get(resourceId);
            if (!resource) {
                resource = new Resource(resourceId);
                this.resources.set(resourceId, resource);
            } else if (!resource.length) {
                // Role is a resource administrator, we cannot add individual permissions
                return;
            }

            if (permissions) {
                resource.allow(permissions);
            }
        }
    }

    /**
     * Removes permissions for a specified resource.
     * @param {string} resourceId - Identifier of the resource whose permissions are to be removed.
     * @param {PermissionTypes?} permissions - The permissions to be denied.
     * @returns {Role} Reference to self to allow for call chaining.
     */
    deny(resourceId: string, permissions?: PermissionTypes): Role {
        if (!resourceId || typeof resourceId !== 'string') {
            throw new Error('Cannot deny resource with invalid identifier');
        }

        if (!this.isAdmin) {
            const resource = this.resources.get(resourceId);
            if (!resource) {
                throw new Error(`Cannot deny permission on missing resource "${resourceId}"`);
            }

            if (!permissions) {
                // Deny resource entirely
                this.resources.delete(resourceId);
                return this;
            }

            // If the resource has no permissions the we consider it as an admin and we cannot deny permissions
            if (resource.length > 0) {
                if (Array.isArray(permissions)) {
                    for (const permission of permissions) {
                        resource.deny(permission);
                    }
                } else {
                    resource.deny(permissions);
                }

                // If all the allowed permissions were removed, delete the resource entirely
                if (!resource.length) {
                    this.resources.delete(resourceId);
                }
            }
        }

        return this;
    }

    /**
     * Determines whether or not a role has been granted specific permissions.
     * @param {string} resourceId - Identifier of the resource whose permissions are to be checked.
     * @param {PermissionTypes} permissions - Permissions to be checked.
     * @returns {boolean} True if permission is granted otherwise false.
     */
    checkPermission(resourceId: string, permissions: PermissionTypes): boolean {
        if (!resourceId || typeof resourceId !== 'string') {
            throw new Error('Cannot check permission with invalid resource id');
        }

        if (!this.isAdmin) {
            const resource = this.resources.get(resourceId);
            if (!resource) {
                return false;
            }

            if (!Array.isArray(permissions)) {
                return resource.checkPermission(permissions);
            }

            for (const permission of permissions) {
                if (!resource.checkPermission(permission)) {
                    return false;
                }
            }
        }

        return true;
    }
}
