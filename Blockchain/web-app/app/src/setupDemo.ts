import {SetupShipment} from './models/setup-shipment.model';
import { Shipment } from "./models/shipment.model";
import { Contract } from "./models/contract.model";
import { Importer } from "./models/importer.model";
import { Shipper } from './models/shipper.model';
import { Grower } from "./models/grower.model";
import {Address} from "./models/address.model";

import {BlockChainModule} from './blockchainClient';
//import { property } from '@loopback/repository';

let blockChainClient = new BlockChainModule.BlockchainClient();

export module SetupShipmentModule {

    export class SetupShipmentClass {

        async setupDemo(setupShipment: SetupShipment) :Promise<string> {
            let networkObj = await blockChainClient.connectToNetwork();
            let smartContract = networkObj.contract;

            let shipmentId = setupShipment.shipmentId;
            let grower: Grower =  this.createGrower(setupShipment);
            let importer: Importer =  this.createImporter(setupShipment);
            let shipper: Shipper =  this.createShipper(setupShipment);
            let contract: Contract =  this.createContract(setupShipment, importer, grower, shipper);
            let shipment: Shipment = this.createShipment(shipmentId, contract);

            let result = await blockChainClient.addShipment(smartContract, shipment);
            return `setup demo - ${result}`;
        }
        
        createGrower(setupDemo: SetupShipment):Grower {
            let email = setupDemo.growerEmail;
            let accountBal = 0;
            let address = new Address({country:'USA',city:'Ridge Spring',street:'350 West Francis Lane',zip:'29122'})
            let grower = new Grower({email:email, address:address, accountBalance:accountBal});
            return grower;
        }

        createImporter(setupDemo: SetupShipment): Importer {
            let email = setupDemo.importerEmail;
            let accountBal = 0;
            let address = new Address({country:'USA',city:'Reno',street:'98 Plumb Ave',zip:'89509'})
            let importer = new Importer({email:email, address:address, accountBalance:accountBal});
            return importer;
        }

        createShipper(setupDemo: SetupShipment): Shipper{
            let email = setupDemo.shipperEmail;
            let accountBal = 0;
            let address = new Address({country:'Panama',city:'Felicidad',street:'Embarcadero 448',zip:'PN654'})
            let shipper = new Shipper({email:email, address:address, accountBalance:accountBal});
            return shipper;
        }

        createContract(setupDemo: SetupShipment, importer: Importer, grower:Grower, shipper: Shipper): Contract {
            let contractId = setupDemo.contractId;
            let contract = new Contract();
            contract.grower = grower;
            contract.shipper = shipper;
            contract.importer = importer;
            contract.arrivalDateTime = this.tomorrow(); // the shipment has to arrive tomorrow
            contract.unitPrice = 0.5;                   // pay 50 cents per unit
            contract.minTemperature = 2;                // min temperature for the cargo
            contract.maxTemperature = 10;               // max temperature for the cargo
            contract.maxAccel = 15000;                  // max acceleration for the cargo
            contract.minPenaltyFactor = 0.2;            // we reduce the price by 20 cents for every degree below the min temp
            contract.maxPenaltyFactor = 0.1;            // we reduce the price by 10 cents for every degree above the max temp
            return contract;
            
        }

        createShipment(shipmentId: string, contract: Contract): Shipment{
            let shipment = new Shipment({shipmentId:shipmentId});
            shipment.type = 'MEDICINE';
            shipment.status = 'IN_TRANSIT';
            shipment.unitCount = 5000;
            shipment.AccelReadings =[];
            shipment.temperatureReadings = [];
            shipment.contract = contract;

            return shipment;
        }

        tomorrow(): Date{
            var currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 1);
            return currentDate;
        }

    }
}