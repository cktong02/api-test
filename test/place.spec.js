var supertest = require("supertest");
var should = require("should");
var sinon = require("sinon");
var env = require("../env")
var server = supertest.agent(env.orderEndpint);
var helper = require("./helper");

describe("Order Endpoints", function () {
    describe("Place Order", function () {

        var invalidStops = [
            { description: "no stops", stops: [] },
            { description: "only one stop", stops: [{ "lat": 22.344674, "lng": 114.124651 }] },
            { description: "same start & end stops", stops: [{ "lat": 22.344674, "lng": 114.124651 }, { "lat": 22.344674, "lng": 114.124651 }] },
            { description: "invalid location", stops: [{ "lat": 22.344674, "lng": 114.124651 }, { "lat": 22.290249, "lng": 114.172478 }] }
        ];

        invalidStops.forEach(({ description, stops }) => {
            describe(`When stops are invalid: ${description}`, function () {
                it("should display missing stops error", function (done) {
                    server.post("/orders")
                        .send({ stops: stops })
                        .set("Accept", "application/json")
                        .expect(400)
                        .end(function (err, res) {
                            res.status.should.equal(400);
                            res.body.message.should.equal("error in field(s): stops");
                            done();
                        });
                });
            });
        });

        var orders = [
            { type: helper.orderType.STANDARD, orderTime: new Date(2019, 8, 1, 16, 0, 0).getTime() },
            { type: helper.orderType.LATE_NIGHT, orderTime: new Date(2019, 8, 1, 22, 0, 0).getTime() }
        ]

        orders.forEach(({ type, orderTime }) => {
            clock = sinon.useFakeTimers(orderTime);

            describe(`When an order is placed at ${type} time: ${new Date()}`, function () {
                it(`should return new order with ${type} fare`, function (done) {
                    helper.place3StopsOrder()
                        .expect(201)
                        .end(function (err, res) {
                            res.status.should.equal(201);
                            res.body.id.should.be.above(0);
                            var expectedDistances = [10600, 3081];
                            res.body.drivingDistancesInMeters.should.deepEqual(expectedDistances);
                            var expectedFare =
                                type == helper.orderType.STANDARD ?
                                    helper.getStandardTripFare(expectedDistances) :
                                    helper.getLateNightTripFare(expectedDistances);
                            Number(res.body.fare.amount).should.equal(expectedFare);
                            done();
                        });
                });
            });

            after(() => {
                clock.restore();
            });
        });

        describe("When an advance order is placed", function () {
            it("should return new order", function (done) {
                server.post("/orders")
                    .send({
                        orderAt: "2020-09-01T05:00:00.000Z",
                        stops: [{
                            "lat": 22.287162, "lng": 114.161272
                        },
                        {
                            "lat": 22.293783, "lng": 114.168746
                        },
                        {
                            "lat": 22.283244, "lng": 114.1762408
                        },
                        {
                            "lat": 22.287162, "lng": 114.161272
                        }]
                    })
                    .set("Accept", "application/json")
                    .expect(201)
                    .end(function (err, res) {
                        res.status.should.equal(201);
                        res.body.id.should.be.above(0);
                        var expectedDistances = [8335, 5984, 2040];
                        res.body.drivingDistancesInMeters.should.deepEqual(expectedDistances);
                        var expectedFare = helper.getStandardTripFare(expectedDistances);
                        Number(res.body.fare.amount).should.equal(expectedFare);
                        done();
                    });
            });
        });

        describe("When a past order is placed", function () {
            it("should display order time error", function (done) {
                helper.place3StopsOrder()
                    .send({ "orderAt": "2018-09-03T13:00:00.000Z" })
                    .expect(400)
                    .end(function (err, res) {
                        res.status.should.equal(400);
                        res.body.message.should.equal("field orderAt is behind the present time");
                        done();
                    });
            });
        });
    });
});