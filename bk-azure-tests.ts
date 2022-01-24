import * as pulumi from "@pulumi/pulumi";
import { MockCallArgs } from "@pulumi/pulumi/runtime";
import "mocha";

pulumi.runtime.setMocks({
    newResource: function(args: pulumi.runtime.MockResourceArgs): {id: string, state: any} {
        return {
            id: args.inputs.name + "_id",
            state: args.inputs,
        };
    },
    call: function(args: MockCallArgs) {
        return args.inputs;
    },
});

describe("Infrastructure", function() {
  let infra: typeof import("./index");

  before(async function() {
      // It's important to import the program _after_ the mocks are defined.
      infra = await import("./index");
  })

  describe("#server", function() {
      // TODO(check 1): Instances have a Name tag.
      it("must have a name tag", function(done) {
        pulumi.all([infra.vm.urn, infra.vm.tags]).apply(([urn, tags]) => {
          if (!tags || !tags["Name"]) {
            done(new Error(`Missing a name tag on server ${urn}`));
          } else {
            done();
          }
        });
      });
      // TODO(check 2): Instances must not use an inline userData script.
      it("must not use customData", function(done) {
        pulumi.all([infra.vm.urn, infra.vm.osProfile.customData]).apply(([urn, userData]) => {
          if (userData) {
            done(new Error(`Illegal user of userData on server ${urn}! Bad puppy!`));
          } else {
            done();
          }
        });
      });
  });

});

// mocha -r ts-node/register azure-tests.ts    