import Role from './role';
import {PermissionTypes} from "./resource";

export default class AccessControl {
    private byId: Record<string, Role> = {};
    private keys: string[] = [];

    /**
     * Removes all roles from the access control object.
     */
    clear() {
        this.byId = {};
        this.keys = [];
    }

    /**
     * Gets the number of roles currently contained within the object.
     */
    get count(): number {
        return this.keys.length;
    }

    /**
     * Creates a new role within the system, if a role already exists with the specified name it is returned instead.
     * @param {string} id - Identifier of the role to be created.
     * @returns {Role} The role associated with the specified identifier.
     */
    createRole(id: string): Role {
        if (!id || typeof id !== 'string') {
            throw new Error('Cannot create role with invalid name');
        }

        let role = this.byId[id];
        if (!role) {
            role = new Role(id);

            this.byId[role.id] = role;
            this.keys.push(role.id);
        }

        return role;
    }

    /**
     * Retrieves the role associated with the supplied identifier.
     * @param {string} id - Identifier of the role to be retrieved.
     * @returns {Role} The role associated with the specified identifier.
     */
    get(id: string) {
        return this.byId[id];
    }

    /**
     * Removes the specified role from the access control provider.
     * @param {string} id - Identifier of the role to be deleted.
     */
    delete(id: string) {
        const {
            [id]: value,
            ...byId
        } = this.byId;

        this.byId = byId;
        this.keys = this.keys.filter(key => key !== id);
    }

    /**
     * Determines whether or not a specified role allows the specified permissions.
     * @param {string} roleId - Identifier of the role to be checked.
     * @param {string} resourceId - Identifier of the resource to be checked.
     * @param {PermissionTypes} permission - Permissions to be verified.
     * @returns {boolean} True if the specified role allows the specified permissions otherwise false.
     */
    checkPermission(roleId: string, resourceId: string, permission: PermissionTypes): boolean {
        return this.get(roleId)?.checkPermission(resourceId, permission);
    }
}
