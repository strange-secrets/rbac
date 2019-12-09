import { expect } from 'chai';
import Resource from '../src/resource';

const TEST_ID = 'test_resource';

const INVALID_IDENTIFIERS = [null, 0.0, 5, '', true, false,];
const VALID_IDENTIFIERS = ['test', '1111', 'resource1',];

const INVALID_PERMISSIONS = [null, 0.0, 5, '', true, false,];
const VALID_PERMISSIONS = ['read', 'write',];

const UNIQUE_PERMISSION = 'unique';

describe('Resource', function() {
    describe('ctor', function() {
        it('Should throw if supplied an invalid identifier', function() {
            expect(function() {
                // @ts-ignore
                new Resource();
            }).to.throw();

            for (const id of INVALID_IDENTIFIERS) {
                expect(function() {
                    // @ts-ignore
                    new Resource(id);
                }).to.throw();
            }
        });

        it('Should succeed with valid parameters', function() {
            for (const id of VALID_IDENTIFIERS) {
                const resource = new Resource(id);

                expect(resource?.id).to.equal(id);
            }
        });
    });

    describe('checkPermission', function() {
        it('Should throw when supplied an invalid permission', function() {
            const resource = new Resource(TEST_ID);

            for (const permission of INVALID_PERMISSIONS) {
                expect(function() {
                    // @ts-ignore
                    resource.checkPermission(permission);
                }).to.throw();
            }
        });

        it('Should return true for everything, when configured as an administrator', function() {
            const resource = new Resource(TEST_ID);

            for (const permission of VALID_PERMISSIONS) {
                expect(resource.checkPermission(permission)).to.be.true;
            }
        });

        it('Should return false for everything when not configured as an administrator', function() {
            const resource = new Resource(TEST_ID);

            resource.allow(UNIQUE_PERMISSION);

            for (const permission of VALID_PERMISSIONS) {
                expect(resource.checkPermission(permission)).to.be.false;
            }
        });
    });

    describe('allow', function() {
        it('Should throw with an invalid permission id', function() {
            const resource = new Resource(TEST_ID);

            for (const permission of INVALID_PERMISSIONS) {
                expect(function() {
                    // @ts-ignore
                    resource.allow(permission);
                }).to.throw();
            }
        });

        it('Should not throw with valid permissions', function() {
            const resource = new Resource(TEST_ID);

            for (const permission of VALID_PERMISSIONS) {
                expect(function() {
                    resource.allow(permission);
                }).not.to.throw();
            }
        });

        it('Should throw when no permissions are specified', function() {
            const resource = new Resource(TEST_ID);

            expect(function () {
                // @ts-ignore
                resource.allow();
            }).to.throw();

            expect(function () {
                // @ts-ignore
                resource.allow(null);
            }).to.throw();

            expect(function () {
                resource.allow('read');
            }).not.to.throw();
        });

        it('Should correctly handle arrays', function() {
            const resource = new Resource(TEST_ID);

            expect(function() {
                // @ts-ignore
                resource.allow(INVALID_PERMISSIONS);
            }).to.throw();
            expect(resource.length).to.equal(0);

            expect(function() {
                resource.allow(VALID_PERMISSIONS);
            }).not.to.throw();
            expect(resource.length).to.equal(VALID_PERMISSIONS.length);
        });
    });

    describe('deny', function() {
        it('Should throw when supplied an invalid permission identifier', function() {
            const resource = new Resource(TEST_ID);

            for (const permission of INVALID_PERMISSIONS) {
                expect(function() {
                    // @ts-ignore
                    resource.deny(permission);
                }).to.throw();
            }
        });

        it('Should ignore permissions when configured as an administrator', function() {
            const resource = new Resource(TEST_ID);

            for (const permission of VALID_PERMISSIONS) {
                expect(function() {
                    resource.deny(permission);
                }).not.to.throw();
                expect(resource.length).to.equal(0);
            }
        });

        it('Should correctly remove permissions', function() {
            const resource = new Resource(TEST_ID);

            resource.allow(VALID_PERMISSIONS);
            resource.allow(UNIQUE_PERMISSION);

            expect(resource.length).to.equal(VALID_PERMISSIONS.length + 1);

            for (const permission of VALID_PERMISSIONS) {
                expect(resource.checkPermission(permission)).to.be.true;
            }

            for (const permission of VALID_PERMISSIONS) {
                resource.deny(permission);
                expect(resource.checkPermission(permission)).to.be.false;
            }

            expect(resource.length).to.equal(1);
            expect(resource.checkPermission(UNIQUE_PERMISSION)).to.be.true;
        });
    });
});
