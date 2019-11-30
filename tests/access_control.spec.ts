import { expect } from 'chai';
import AccessControl from '../src/access_control';

const UNIQUE_ROLE = 'unique_role';

const VALID_ROLES = ['file_system', 'display', 'controller'];
const INVALID_ROLES = [null, 0.0, 5, '', true, false];

describe('AccessControl', function() {
    describe('createRole', function() {
        it('Should throw if supplied an invalid identifier', function() {
            const access = new AccessControl();

            for (const id of INVALID_ROLES) {
                expect(function() {
                    // @ts-ignore - Allow us to pass invalid types in
                    access.createRole(id);
                }).to.throw();
            }
        });

        it('Should correctly creates roles with valid identifiers', function() {
            const access = new AccessControl();

            for (const id of VALID_ROLES) {
                expect(function() {
                    access.createRole(id);
                }).not.to.throw();
            }

            expect(access.count).to.equal(VALID_ROLES.length);
        });

        it('Should return previously created roles when supplied the same identifier', function() {
            const access = new AccessControl();

            const roles = VALID_ROLES.map(id => access.createRole(id));

            expect(roles.length).to.equal(VALID_ROLES.length);

            const count = VALID_ROLES.length;
            for (let loop = 0; loop < count; ++loop) {
                expect(access.createRole(VALID_ROLES[loop])).to.equal(roles[loop]);
                expect(roles[loop].id).to.equal(VALID_ROLES[loop]);
            }
        });
    });

    describe('getRole', function() {
        it('Should allow us to retrieve created roles', function() {
            const access = new AccessControl();

            const roles = VALID_ROLES.map(id => access.createRole(id));

            expect(roles.length).to.equal(VALID_ROLES.length);

            const count = VALID_ROLES.length;
            for (let loop = 0; loop < count; ++loop) {
                expect(access.get(VALID_ROLES[loop])).to.equal(roles[loop]);
            }
        });

        it('Should return undefined for unknown roles', function() {
            const access = new AccessControl();

            const roles = VALID_ROLES.map(id => access.createRole(id));

            expect(roles.length).to.equal(VALID_ROLES.length);

            expect(access.get(UNIQUE_ROLE)).not.to.exist;
        });
    });

    describe('clear', function() {
        it('Should remove all registered roles', function() {
            const access = new AccessControl();

            VALID_ROLES.forEach(id => access.createRole(id));

            expect(access.count).to.equal(VALID_ROLES.length);
            access.clear();
            expect(access.count).to.equal(0);
        });
    });

    describe('delete', function() {
        it('Should ignore roles that do not exist', function() {
            const access = new AccessControl();

            VALID_ROLES.forEach(id => access.createRole(id));
            expect(access.count).to.equal(VALID_ROLES.length);

            access.delete(UNIQUE_ROLE);

            expect(access.count).to.equal(VALID_ROLES.length);
        });

        it('Should remove previously created roles', function() {
            const access = new AccessControl();

            VALID_ROLES.forEach(id => access.createRole(id));
            expect(access.count).to.equal(VALID_ROLES.length);

            let expectedCount = VALID_ROLES.length;
            for (const id of VALID_ROLES) {
                expectedCount--;
                access.delete(id);

                expect(access.count).to.equal(expectedCount);
            }
        });
    });
});
