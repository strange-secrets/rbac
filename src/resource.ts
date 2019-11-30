
export type PermissionTypes = string[] | string;

export default class Resource {
    public readonly id: string;
    private allowed: string[];

    constructor(id: string) {
        if (!id || typeof id !== 'string') {
            throw new Error('Cannot create resource with invalid identifier');
        }

        this.id = id;
        this.allowed = [];
    }

    /**
     * Gets the number of permissions that are currently assigned to this resource.
     * @returns {number} The number of permissions currently assigned to this resource.
     */
    get length(): number {
        return this.allowed.length;
    }

    /**
     *
     * @param permissions
     */
    allow(permissions: PermissionTypes) {
        if (!permissions) {
            throw new Error('No allowable permissions were specified');
        }

        if (Array.isArray(permissions)) {
            for (const permission of permissions) {
                if (!permission || typeof permission !== 'string') {
                    throw new Error('Cannot allow invalid permission');
                }

                if (-1 === this.allowed.indexOf(permission)) {
                    this.allowed.push(permission);
                }
            }
        } else {
            if (!permissions || typeof permissions !== 'string') {
                throw new Error('Cannot allow invalid permission');
            }

            if (-1 === this.allowed.indexOf(permissions)) {
                this.allowed.push(permissions);
            }
        }
    }

    /**
     * Removes the specified permission from the resource.
     * @param {string} permission - The permission to be removed from the resource.
     */
    deny(permission: string) {
        if (!permission || typeof permission !== 'string') {
            throw new Error('Cannot deny invalid permission');
        }

        this.allowed = this.allowed.filter(id => id !== permission);
    }

    /**
     * Determines whether or not the resource has been granted access to the specified permission.
     * @param {string} permission - The permission to be checked within the resource.
     * @returns {boolean} True if the specified permission is allowed otherwise false.
     */
    checkPermission(permission: string): boolean {
        if (!permission || typeof permission  !== 'string') {
            throw new Error('Cannot check invalid permission');
        }

        return (!this.allowed.length || -1 !== this.allowed.indexOf(permission));
    }
}
