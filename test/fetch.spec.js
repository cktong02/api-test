var supertest = require("supertest");
var should = require("should");
var env = require("../env")
var server = supertest.agent(env.orderEndpint);
var helper = require("./helper");

describe("Order Endpoints", function () {
    describe("Fetch Order", function () {
        describe("When the order does not present", function () {
            it("should return order not found error", function (done) {
                var testRequest = server.get("/orders/0");
                helper.shouldReturnOrderNotFoundError(testRequest, done);
            }).timeout(env.endpointTimeout.GET);
        });

        describe("When the order presents", function () {
            it("should return the order", function (done) {
                helper.place3StopsOrder().then(res => {
                    var orderId = res.body.id;

                    server.get(`/orders/${orderId}`)
                        .expect(200)
                        .end(function (err, res) {
                            res.status.should.equal(200);
                            res.body.id.should.equal(orderId);
                            res.body.status.should.equal("ASSIGNING");
                            res.body.drivingDistancesInMeters.should.deepEqual([10600, 3081]);
                            res.body.should.have.propertyByPath("fare", "amount").above(0);
                            res.body.should.have.property("orderDateTime");
                            res.body.should.have.property("createdTime");
                            done();
                        });
                });
            }).timeout(env.endpointTimeout.GET);
        });
    });
});