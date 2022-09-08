package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	chiadapter "github.com/awslabs/aws-lambda-go-api-proxy/chi"
	"github.com/go-chi/chi"
	"github.com/go-chi/render"
)

var chiLambda *chiadapter.ChiLambda

// handler is the function called by the lambda.
func handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	fmt.Println("inside handler")
	return chiLambda.ProxyWithContext(ctx, req)
}

// main is called when a new lambda starts, so don't
// expect to have something done for every query here.
func main() {
	fmt.Println("initiated lambda")
	// init go-chi router
	r := chi.NewRouter()
	fmt.Println("created router")
	chiLambda = chiadapter.New(r)
	r.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("begin HandleFunc")
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			fmt.Println("failed to read body")
			return
		}
		var requestBody string
		if body != nil {
			requestBody = string(body)
		}
		err = render.Render(w, r, &apiResponse{
			Status:      http.StatusOK,
			URL:         r.URL.String(),
			RequestBody: requestBody,
		})
		if err != nil {
			fmt.Println("failed to render response")
			return
		}
		fmt.Println("HandleFunc complete")
	})
	fmt.Println("starting lambda")
	// start the lambda with a context
	lambda.StartWithOptions(handler, lambda.WithContext(context.Background()))
}

// apiResponse is the response to the API.
type apiResponse struct {
	Status      int    `json:"status_code,omitempty"`
	URL         string `json:"url,omitempty"`
	RequestBody string `json:"request_body,omitempty"`
}

// Render is used by go-chi-render to render the JSON response.
func (a apiResponse) Render(w http.ResponseWriter, r *http.Request) error {
	fmt.Println("rendering response")
	render.Status(r, a.Status)
	return nil
}
