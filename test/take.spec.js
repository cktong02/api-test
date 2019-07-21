var supertest = require("supertest");
var should = require("should");
var env = require("../env")
var server = supertest.agent(env.orderEndpint);
var helper = require("./helper");

describe("Order Endpoints", function () {
    describe("Take Order", function () {
        describe("When the order does not present", function () {
            it("should return order not found error", function (done) {
                var testRequest = server.put("/orders/0/take");
                helper.shouldReturnOrderNotFoundError(testRequest, done);
            }).timeout(env.endpointTimeout.PUT);
        });

        describe("When an assigning order presents", function () {
            it("should mark the order as ongoing", function (done) {
                helper.place3StopsOrder().then(res => {
                    var orderId = res.body.id;

                    server.put(`/orders/${orderId}/take`)
                        .expect(200)
                        .end(function (err, res) {
                            res.status.should.equal(200);
                            res.body.id.should.equal(orderId);
                            res.body.status.should.equal("ONGOING");
                            res.body.should.have.property("ongoingTime");
                            done();
                        });
                });
            }).timeout(env.endpointTimeout.PUT);
        });

        describe("When the order is not in assigning status", function () {
            it("should return violated logic flow error", function (done) {
                helper.place3StopsOrder().then(res => {
                    var orderId = res.body.id;

                    server.put(`/orders/${orderId}/take`).then(res => {
                        //take an ONGOING order
                        var testRequest = server.put(`/orders/${orderId}/take`);
                        helper.shouldReturnViolatedLogicFlowError(testRequest, "Order status is not ASSIGNING", done);
                    });
                });
            }).timeout(env.endpointTimeout.PUT);
        });
    });
});