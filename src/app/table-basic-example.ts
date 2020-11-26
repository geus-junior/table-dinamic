import { HttpClient } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  Injectable,
  OnDestroy,
  ViewChild
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, EMPTY } from "rxjs";
import { catchError, map } from "rxjs/operators";

export interface InterfaceLegalPerson {
  id: number;
  cnpj: string;
  razaoSocial: string;
}

export class LegalPerson implements InterfaceLegalPerson {
  id: number;
  cnpj: string;
  razaoSocial: string;

  constructor(id: number, cnpj: string, razaoSocial: string) {
    this.id = id;
    this.cnpj = cnpj;
    this.razaoSocial = razaoSocial;
  }
  
}

export interface InterfaceNaturalPerson {
  id: number;
  cpf: string;
}

export class NaturalPerson implements InterfaceNaturalPerson {
  id: number;
  cpf: string;

  constructor(id: number, cpf: string) {
    this.id = id;
    this.cpf = cpf;
  }
  
}

export interface InterfacePerson {
  id: number;
  name: string;
  legalPerson: InterfaceLegalPerson;
  naturalPerson: InterfaceNaturalPerson;
}

export class Person implements InterfacePerson {
  id: number;
  name: string;
  legalPerson: LegalPerson;
  naturalPerson: NaturalPerson;

  constructor(id: number, name: string, legalPerson: LegalPerson, naturalPerson: NaturalPerson) {
    this.id = id;
    this.name = name;
    this.legalPerson = legalPerson;
    this.naturalPerson = naturalPerson;
  }
  
}

export interface InterfaceClient {
  id: number;
  person: InterfacePerson;
  dateTimeLastBackup: Date;
  dateBlockingContingency: Date;
  blocked: boolean;
}

export class Clients implements InterfaceClient {
  id: number;
  person: Person;
  dateTimeLastBackup: Date;
  dateBlockingContingency: Date;
  blocked: boolean;

  constructor(id: number, person: Person, dateTimeLastBackup: Date, dateBlockingContingency: Date, blocked: boolean) {
    this.id = id;
    this.person = person;
    this.dateTimeLastBackup = dateTimeLastBackup;
    this.dateBlockingContingency = dateBlockingContingency;
    this.blocked = blocked;
  }
}

@Injectable({
  providedIn: "root"
})
export class ClientService {
  private _baseUrl: string = "http://localhost:3000/client";

  constructor(private _httpClient: HttpClient) {}

  handleError(error: any): Observable<any> {
    alert("Ocorreu um erro, motivo: " + error.statusText);
    return EMPTY; // Retorna um observer vazio no caso de acontecer um erro.
  }

  // GET - Busca todos os clientes
  findAll(): Observable<Clients[]> {
    return this._httpClient.get<Clients[]>(this._baseUrl).pipe(
      map(obj => obj),
      catchError(error => this.handleError(error))
    );
  }
}

@Component({
  selector: "table-basic-example",
  styleUrls: ["table-basic-example.css"],
  templateUrl: "table-basic-example.html"
})
export class Client implements AfterViewInit, OnDestroy {
  dataSource: MatTableDataSource<Clients>;
  displayedColumns: string[] = ["id", "name", "cpfOrCnpj", "dateTimeLastBackup",   "dateBlockingContingency", "blocked"];

  private _EventFindClient: any;

  constructor(private _clientService: ClientService) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this._EventFindClient = this._clientService.findAll().subscribe(clients => {
      this.dataSource = new MatTableDataSource(clients);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.dataSource.filterPredicate = (
        data: Clients,
        filter: string
      ): boolean => {
        return (
          data.id.toString().includes(filter) ||
          data.person.name.toLocaleLowerCase().includes(filter) ||
          data.person.legalPerson.cnpj.toLocaleLowerCase().includes(filter) ||
          data.person.naturalPerson.cpf.toLocaleLowerCase().includes(filter)
        );
      };
    });
  }

  ngOnDestroy() {
    this._EventFindClient.unsubscribe();
  }
}
