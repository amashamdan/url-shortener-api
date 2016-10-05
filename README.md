### URL Shortener API (under development)

An API which returns a shortened url.

   * In this service, the user can enter URL as parameter and receive a shortened URL in the response. The shortened URL is the same as this page's URL plus a unique key assigned to the provided URL.
		
   * If the user clicks on the shortened URL or enters it in the address bar, the user will be redirected to the original link's page.
		
   * If the user enters an invalid URL or a non-existing key, an error message will be received as response.

Examples

The follwing shows url entered and the expected result.

URL
`https://amer-url-short.herokuapp.com/http://www.google.com`

Result`{"entered_Url":"http://www.google.com","shortened_Url":"https://amer-url-short.herokuapp.com/26"}`


URL
`https://amer-url-short.herokuapp.com/26`

Result `The user will be redirected to www.google.com`

URL
`https://amer-url-short.herokuapp.com/www.google.com`

Result
`{"error":"URL entered is not valid, please make sure it is entered in the correct format and try again."}`