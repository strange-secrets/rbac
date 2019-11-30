import { expect } from 'chai';
import Role from '../src/role';

const TEST_ROLE = 'test_role';

const INVALID_IDENTIFIERS = [
    null, 0.0, 5, '', true, false,
];

const VALID_IDENTIFIERS = [
    'test', '1111', 'resource1',
];

const UNIQUE_RESOURCE = 'unique_resource';
const UNIQUE_PERMISSION = 'unique_permission';

const INVALID_RESOURCES = [
    null, 0.0, 5, '', true, false,
];

const VALID_RESOURCES = [
    'file_system',
    'display',
];

const VALID_PERMISSIONS = [
    'read',
    'write',
    'edit',
];

describe('Role', function() {
    describe('ctor', function() {
        it('Should throw if supplied an invalid identifier', function() {
            expect(function() {
                // @ts-ignore
                new Role();
            }).to.throw();

            for (const id of INVALID_IDENTIFIERS) {
                expect(function() {
                    // @ts-ignore
                    new Role(id);
                }).to.throw();
            }
        });

        it('Should succeed with valid parameters', function() {
            for (const id of VALID_IDENTIFIERS) {
                const role = new Role(id);

                expect(role.id).to.equal(id);
            }
        });
    });

    describe('allow', function() {
        it('Should throw when supplied an invalid resource identifier', function() {
            const role = new Role(TEST_ROLE);
            expect(role.isAdmin).to.be.false;

            for (const id of INVALID_RESOURCES) {
                expect(function() {
                    // @ts-ignore
                    role.allow(id, VALID_PERMISSIONS);
                }).to.throw();
            }

            const admin = Role.createAdmin(TEST_ROLE);
            for (const id of INVALID_RESOURCES) {
                expect(function() {
                    // @ts-ignore
                    admin.allow(id, VALID_PERMISSIONS);
                }).to.throw();
            }
        });

        it('Should throw when no permissions are specified', function() {
            const role = new Role(TEST_ROLE);

            for (const resourceId of VALID_RESOURCES) {
                expect(function () {
                    // @ts-ignore
                    role.allow(resourceId);
                }).to.throw();

                expect(function () {
                    // @ts-ignore
                    role.allow(resourceId, null);
                }).to.throw();

                expect(function () {
                    role.allow(resourceId, 'read');
                }).not.to.throw();
            }
        });

        it('Should not add permissions to admin resources', function() {
            const role = Role.createAdmin(TEST_ROLE);

            expect(role.isAdmin).to.be.true;

            for (const id of VALID_RESOURCES) {
                expect(function() {
                    role.allow(UNIQUE_RESOURCE, id);
                }).not.to.throw();
            }
        });

        it('Should add permissions when resource is not administrative', function() {
            const role = new Role(TEST_ROLE);

            role.allow(UNIQUE_RESOURCE, UNIQUE_PERMISSION);

            for (const id of VALID_RESOURCES) {
                expect(role.checkPermission(UNIQUE_RESOURCE, id)).to.be.false;
                expect(function() {
                    role.allow(UNIQUE_RESOURCE, id);
                }).not.to.throw();
                expect(role.checkPermission(UNIQUE_RESOURCE, id)).to.be.true;
            }
        });
    });

    describe('deny', function() {
        it('Should throw when supplied an invalid identifier', function() {
            const role = new Role(TEST_ROLE);

            for (const id of INVALID_RESOURCES) {
                expect(function() {
                    // @ts-ignore
                    role.deny(id, UNIQUE_PERMISSION);
                }).to.throw();
            }

            const admin = Role.createAdmin(TEST_ROLE);
            expect(admin.isAdmin).to.be.true;

            for (const id of INVALID_RESOURCES) {
                expect(function() {
                    // @ts-ignore
                    admin.deny(id, UNIQUE_PERMISSION);
                }).to.throw();
            }
        });

        it('Should throw when the resource does not exist', function() {
            const role = new Role(TEST_ROLE);

            for (const id of VALID_RESOURCES) {
                expect(function() {
                    role.deny(id, UNIQUE_PERMISSION);
                }).to.throw();
            }
        });

        it('Should not throw when the resource does not exist, when the role is an administrator', function() {
            const role = Role.createAdmin(TEST_ROLE);
            expect(role.isAdmin).to.be.true;

            for (const id of VALID_RESOURCES) {
                expect(function() {
                    role.deny(id, UNIQUE_PERMISSION);
                }).not.to.throw();
            }
        });

        it('Should correctly remove permissions from a resource', function() {
            const role = new Role(TEST_ROLE);

            role.allow(UNIQUE_RESOURCE, VALID_PERMISSIONS);
            role.allow(UNIQUE_RESOURCE, UNIQUE_PERMISSION);

            for (const id of VALID_PERMISSIONS) {
                expect(role.checkPermission(UNIQUE_RESOURCE, id)).to.be.true;
                expect(function() {
                    role.deny(UNIQUE_RESOURCE, id);
                }).not.to.throw();
                expect(role.checkPermission(UNIQUE_RESOURCE, id)).to.be.false;
            }
            expect(role.checkPermission(UNIQUE_RESOURCE, UNIQUE_PERMISSION)).to.be.true;
        });

        it('Should remove a resource entirely if all permissions are removed', function() {
            const role = new Role(TEST_ROLE);

            role.allow(UNIQUE_RESOURCE, VALID_PERMISSIONS);
            role.allow(UNIQUE_RESOURCE, UNIQUE_PERMISSION);

            expect(role.has(UNIQUE_RESOURCE)).to.be.true;

            role.deny(UNIQUE_RESOURCE, UNIQUE_PERMISSION);
            role.deny(UNIQUE_RESOURCE, VALID_PERMISSIONS);

            expect(role.has(UNIQUE_RESOURCE)).to.be.false;
        });

        it('Should remove a resource entirely if no permissions are specified', function() {
            const role = new Role(TEST_ROLE);

            role.allow(UNIQUE_RESOURCE, VALID_PERMISSIONS);
            role.allow(UNIQUE_RESOURCE, UNIQUE_PERMISSION);

            expect(role.has(UNIQUE_RESOURCE)).to.be.true;

            role.deny(UNIQUE_RESOURCE);

            expect(role.has(UNIQUE_RESOURCE)).to.be.false;
        });
    });

    describe('checkPermission', function() {
        it('Should throw when supplied an invalid identifier', function() {
            const role = new Role(TEST_ROLE);

            for (const id of INVALID_RESOURCES) {
                expect(function() {
                    // @ts-ignore
                    role.checkPermission(id, UNIQUE_PERMISSION);
                }).to.throw();
            }
        });

        it('Should return false if the resource does not exist', function() {
            const role = new Role(TEST_ROLE);

            for (const id of VALID_PERMISSIONS) {
                expect(role.checkPermission(UNIQUE_RESOURCE, id)).to.be.false;
            }
        });

        it('Should check all items in an array', function() {
            const role = new Role(TEST_ROLE);

            role.allow(UNIQUE_RESOURCE, VALID_PERMISSIONS);

            expect(role.checkPermission(UNIQUE_RESOURCE, VALID_PERMISSIONS)).to.be.true;
            expect(role.checkPermission(UNIQUE_RESOURCE, [...VALID_PERMISSIONS, UNIQUE_PERMISSION])).to.be.false;
            expect(role.checkPermission(UNIQUE_RESOURCE, [UNIQUE_PERMISSION, ...VALID_PERMISSIONS])).to.be.false;
        });

        it('Should correctly handle single string permissions', function() {
            const role = new Role(TEST_ROLE);

            role.allow(UNIQUE_RESOURCE, VALID_PERMISSIONS);

            for (const id of VALID_PERMISSIONS) {
                expect(role.checkPermission(UNIQUE_RESOURCE, id)).to.be.true;
            }

            expect(role.checkPermission(UNIQUE_RESOURCE, UNIQUE_PERMISSION)).to.be.false;
        });
    });
});
