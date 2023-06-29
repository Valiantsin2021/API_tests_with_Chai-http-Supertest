import request from 'supertest'
import chai from 'chai'
const expect = chai.expect
const should = chai.should()
import dotenv from 'dotenv'
dotenv.config()
import Chance from 'chance'
const chance = new Chance()
const name = chance.name()
const email = chance.email()
const gender = chance.gender()
const patchedName = chance.name()
const patchedEmail = chance.email()
const patchedGender = chance.gender()
const status = randomStatus()
const patchedStatus = randomStatus()
const url = process.env.URL
const bearer = process.env.TOKEN
let id
let patchedId
function randomStatus() {
  const random = chance.coin()
  if (random === 'heads') {
    return 'active'
  } else {
    return 'inactive'
  }
}
describe(`Supertest gorest API`, function () {
  it('should fetch users with GET request from GOREST API', done => {
    request(url)
      .get('/')
      .expect(200)
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res.body).to.not.be.null.and.not.be.undefined
        res.body.should.be.a('array').and.have.length(10)
        expect(res.headers).to.have.property(
          'content-type',
          'application/json; charset=utf-8'
        )
        res.body.forEach(object => {
          expect(object).to.have.all.keys(
            'id',
            'name',
            'email',
            'gender',
            'status'
          )
        })
        done()
      })
  })
  it('Should add new user with POST request and enshure the user created', done => {
    request(url)
      .post('/')
      .set({ Authorization: `Bearer ${bearer}` })
      .send({
        name,
        email,
        gender,
        status
      })
      .expect(201)
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res.body).to.not.be.null.and.not.be.undefined
        expect(res.body).to.have.all.keys(
          'id',
          'name',
          'email',
          'gender',
          'status'
        )
        expect(Object.values(res.body)).to.include(name, email, gender, status)
        id = res.body.id
        done()
      })
  })
  it(`Should GET the created user`, done => {
    request(url)
      .get(`/`)
      .set({ Authorization: `Bearer ${bearer}` })
      .query({ name, email })
      .expect(200)
      .end(function (err, res) {
        expect(res.body).to.not.be.null.and.not.be.undefined
        expect(Object.values(res.body[0])).to.include(
          name,
          email,
          gender,
          status
        )
        done()
      })
  })
  it('should successfully preform PATCH request to modify the created user', done => {
    request(url)
      .patch(`/${id}`)
      .set({ Authorization: `Bearer ${bearer}` })
      .send({
        name: patchedName,
        email: patchedEmail,
        gender: patchedGender,
        status: patchedStatus
      })
      .expect(200)
      .end(function (err, res) {
        expect(res.body).to.not.be.null.and.not.be.undefined
        res.body.should.include({
          name: patchedName,
          email: patchedEmail,
          gender: patchedGender.toLowerCase(),
          status: patchedStatus
        })
        patchedId = res.body.id
        done()
      })
  })
  it('should perform GET request and check the updated user appeared in the database', done => {
    request(url)
      .get(`/`)
      .set({ Authorization: `Bearer ${bearer}` })
      .query({ patchedName, patchedEmail })
      .expect(200)
      .end(function (err, res) {
        expect(res.body).to.not.be.null.and.not.be.undefined
        expect(Object.values(res.body[0])).to.include(
          patchedName,
          patchedEmail,
          patchedGender,
          patchedStatus
        )
        done()
      })
  })
  it('should successfully preform DELETE request to delete the created user', done => {
    request(url)
      .delete(`/${patchedId}`)
      .set({ Authorization: `Bearer ${bearer}` })
      .expect(204)
      .end(function (err, res) {
        expect(res.body).to.not.be.null.and.not.be.undefined
        done()
      })
  })
  it('should perform GET request and check the deleted user is deleted in the database', done => {
    request(url)
      .get(`/${patchedId}`)
      .set({ Authorization: `Bearer ${bearer}` })
      .expect(404)
      .end(function (err, res) {
        expect(res.body).to.not.be.null.and.not.be.undefined
        res.body.message.should.deep.include('Resource not found')
        done()
      })
  })
})
