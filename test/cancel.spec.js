var supertest = require("supertest");
var should = require("should");
var env = require("../env")
var server = supertest.agent(env.orderEndpint);
var helper = require("./helper");

describe("Order Endpoints", function () {
    describe("Cancel Order", function () {
        describe("When the order does not present", function () {
            it("should return order not found error", function (done) {
                var testRequest = server.put("/orders/0/cancel");
                helper.shouldReturnOrderNotFoundError(testRequest, done);
            }).timeout(env.endpointTimeout.PUT);
        });

        describe("When an assigning or ongoing order presents", function () {
            it("should mark the order as cancelled", function (done) {
                helper.place3StopsOrder().then(res => {
                    var orderId = res.body.id;

                    server.put(`/orders/${orderId}/cancel`)
                        .expect(200)
                        .end(function (err, res) {
                            res.status.should.equal(200);
                            res.body.id.should.equal(orderId);
                            res.body.status.should.equal("CANCELLED");
                            res.body.should.have.property("cancelledAt");
                            done();
                        });
                });
            }).timeout(env.endpointTimeout.PUT);
        });

        describe("When the order is not in assigning or ongoing status", function () {
            describe("The order is CANCELLED", function () {
                it("should return violated logic flow error", function (done) {
                    helper.place3StopsOrder().then(res => {
                        var orderId = res.body.id;

                        server.put(`/orders/${orderId}/cancel`).then(res => {
                            //cancel a CANCELLED order again
                            var testRequest = server.put(`/orders/${orderId}/cancel`);
                            helper.shouldReturnViolatedLogicFlowError(testRequest, "Order status is COMPLETED already", done);
                        });
                    });
                }).timeout(env.endpointTimeout.PUT);
            });

            describe("The order is COMPLETE", function () {
                it("should return violated logic flow error", function (done) {
                    helper.place3StopsOrder().then(res => {
                        var orderId = res.body.id;

                        server.put(`/orders/${orderId}/take`).then(res => {
                            server.put(`/orders/${orderId}/complete`).then(res => {
                                //cancel a COMPLETED order
                                var testRequest = server.put(`/orders/${orderId}/cancel`);
                                helper.shouldReturnViolatedLogicFlowError(testRequest, "Order status is COMPLETED already", done);
                            });
                        });
                    });
                }).timeout(env.endpointTimeout.PUT);
            });
        });
    });
});