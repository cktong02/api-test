var supertest = require("supertest");
var should = require("should");
var env = require("../env")
var server = supertest.agent(env.orderEndpint);
var helper = require("./helper");

describe("Order Endpoints", function () {
    describe("Complete Order", function () {
        describe("When the order does not present", function () {
            it("should return order not found error", function (done) {
                var testRequest = server.put("/orders/0/complete");
                helper.shouldReturnOrderNotFoundError(testRequest, done);
            }).timeout(env.endpointTimeout.PUT);
        });

        describe("When an ongoing order presents", function () {
            it("should mark the order as completed", function (done) {
                helper.place3StopsOrder().then(res => {
                    var orderId = res.body.id;

                    //take order as ONGOING
                    server.put(`/orders/${orderId}/take`).then(res => {
                        server.put(`/orders/${orderId}/complete`)
                            .expect(200)
                            .end(function (err, res) {
                                res.status.should.equal(200);
                                res.body.id.should.equal(orderId);
                                res.body.status.should.equal("COMPLETED");
                                res.body.should.have.property("completedAt");
                                done();
                            });
                    });
                });
            }).timeout(env.endpointTimeout.PUT);
        });

        describe("When the order is not in ongoing status", function () {
            it("should return violated logic flow error", function (done) {
                helper.place3StopsOrder().then(res => {
                    var orderId = res.body.id;

                    //complete an ASSIGNING order
                    var testRequest = server.put(`/orders/${orderId}/complete`);
                    helper.shouldReturnViolatedLogicFlowError(testRequest, "Order status is not ONGOING", done);
                });
            }).timeout(env.endpointTimeout.PUT);
        });
    });
});