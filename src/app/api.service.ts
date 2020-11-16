import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, } from '@angular/common/http';
import { retry, catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private SERVER_URL = "http://localhost:3000/products";
  public first: string = "";
  public prev: string = "";
  public next: string = "";
  public last: string = "";

  constructor(private httpClient: HttpClient) { }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }



  parseLinkHeader(header: any) {
    if (header.length == 0) {
      return ;
    }

    let parts = header.split(',');
    var links = {
      first: '',
      last: '',
      prev: '',
      next: ''
    };

    parts.forEach((p: String) => {
      let section = p.split(';');
      var name: String;
      var url = section[0].replace(/<(.*)>/, '$1').trim();
      name = section[1].replace(/rel="(.*)"/, '$1').trim();
      links[name] = url;

      this.first  = links["first"];
      this.last   = links["last"];
      this.prev   = links["prev"];
      this.next   = links["next"];
    });
  }

  public sendGetRequest(){
    return this.httpClient.get(this.SERVER_URL, {  params: new HttpParams({fromString: "_page=1&_limit=20"}), observe: "response"}).pipe(retry(3), catchError(this.handleError), tap(res => {
      console.log(res.headers.get('Link'));
      this.parseLinkHeader(res.headers.get('Link'));
    }));
  }

  public sendGetRequestToUrl(url: string){
    return this.httpClient.get(url, { observe: "response"}).pipe(retry(3),
    catchError(this.handleError), tap(res => {
      console.log(res.headers.get('Link'));
      this.parseLinkHeader(res.headers.get('Link'));
    }));
  }
}
