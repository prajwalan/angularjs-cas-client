# angularjs-cas-client
This is a simple demo of an Angular JS based CAS client.

Let us say that we have a CAS server located at `https://localhost:8443/cas`.
And we have a REST based web service at following location: `https://localhost:8443/library` with following two operations:
- `GET /api/book/GetBooks`
- `POST /api/book/AddBook`

From the web browser one can login to the CAS through `https://localhost:8443/cas/login` and execute the HTTP calls to the library service.
But when an API is behind CAS and we need to access it programatically, we have two options 
1. either fetch the login ticket send it along with username and password to `/cas/login` 
2. or use the RESTful CAS approach.

Problem with the first approach can be CORS related hassles because the authentication will be traditional session cookie based. And this does not play that well with CORS as the OPTIONS header do not carry session cookies.
And problem with the RESTful client is that for every service call, we need to fetch a service ticket. This eventually means one additional call to CAS for every service call, unless the CAS is configured to re-use service tickets.

This example demostratates the first approach.
