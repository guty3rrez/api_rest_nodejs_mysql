const axios = require("axios");

const tokenDeIntegracionEnvios = "629ab4a902d54239989cd1c2f3d20dfa";
const tokenDeIntegracionCobertura = "64d8ab1b01774c57b2b9f5a365e927e2";
const tokenDeIntegracionCotizaciones = "5ec28a9603274d8db7510049580feaa6";


async function crearEnvio(req, res){

    let { customerCardNumber, countyOfOriginCoverageCode, countyCoverageCode, rStreetName, rStreetNumber, dStreetName, dStreetNumber } = req.body;
    let { rFullName, rPhoneNumber, rMail, dFullName, dPhoneNumber, dMail } = req.body;
    let { weight, height, width, length, serviceDeliveryCode, deliveryReference, groupReference } = req.body;


    let headers = { "Ocp-Apim-Subscription-Key": tokenDeIntegracionEnvios }

    let data = {
        header: {
            customerCardNumber, //TCC
            countyOfOriginCoverageCode, //Codigo cobertura origen
            labelType: "2",
        },
        details: [{
            addresses: [
                { //Direccion de envio
                    countyCoverageCode: countyCoverageCode,
                    streetName: dStreetName,
                    streetNumber: dStreetNumber,
                    addressType: "DEST",
                  },
                  { //Direccion de retorno en caso de que no se pueda entregar el paquete
                    countyCoverageCode: countyOfOriginCoverageCode,
                    streetName: rStreetName,
                    streetNumber: rStreetNumber,
                    addressType: "DEV",
                  }
            ],
            contacts: [
                {
                    name:rFullName, //Nombre completo remitente
                    phoneNumber:rPhoneNumber, //Telefono remitente
                    mail: rMail, //Correo remitente
                    contactType:"R"
                },
                {
                    name:dFullName, //Nombre completo destinatario
                    phoneNumber: dPhoneNumber, //Telefono destinatario
                    mail:dMail, //Correo destinatario
                    contactType:"D"
                },
            ],
            packages: [{
                weight,
                height,
                width,
                length,
                serviceDeliveryCode, //Código del servicio de entrega, obtenido de la API Cotización
                productCode: "1",
                deliveryReference,
                groupReference,
              }],
        }],

    }

    try {
        let response = await axios.post("http://testservices.wschilexpress.com/transport-orders/api/v1.0/transport-orders", data, { headers });
        res.send(response.data)
    } catch (error) {
        res.send(error)
    }


}

async function cotizar(req, res){
    let headers = { "Ocp-Apim-Subscription-Key": tokenDeIntegracionCotizaciones }
    let { originCountyCode, destinationCountyCode, weight, height, width, length } = req.body;
    let data = {
        originCountyCode,
        destinationCountyCode,
        package: {
            weight,
            height,
            width,
            length,
        },
        productType: 1,
        contentType: 1,
        declaredWorth: 1000,
        deliveryTime: 0
    }
    try {
        let response = await axios.post("http://testservices.wschilexpress.com/rating/api/v1.0/rates/courier", data, { headers })
        //serviceTypeCode es el codigo util
        return response.data.data.courierServiceOptions;
    } catch (error) {
        console.log(error);   
    }
}

async function consultarRegiones(req, res) {
    let headers = { "Ocp-Apim-Subscription-Key": tokenDeIntegracionCobertura }

    try {
        let response = await axios.get("http://testservices.wschilexpress.com/georeference/api/v1.0/regions", { headers })
        console.log(response)
        res.send(response.data.regions);
    } catch (error) {
        res.send(error)
    }

    // {
    //     "regionId": "R1",
    //     "regionName": "TARAPACA",
    //     "ineRegionCode": 1
    // }

}

async function consultarCobertura(req, res){
    let headers = { "Ocp-Apim-Subscription-Key": tokenDeIntegracionCobertura }

    let { regionCode } = req.body;

    // let regionCode = "RM";

    let url = `http://testservices.wschilexpress.com/georeference/api/v1.0/coverage-areas?RegionCode=${regionCode}&type=0`

    try {
        let response = await axios.get(url, { headers });
        res.send(response.data.coverageAreas);
    } catch (error) {
        res.send(error)
    }

    // {
    //     "countyCode": "ALHU", ESTE ES EL QUE SE USA PARA EL CALCULO
    //     "countyName": "ALHUE",
    //     "regionCode": "RM",
    //     "ineCountyCode": 663,
    //     "queryMode": 1,
    //     "coverageName": "ALHUE"
    // }

}

async function consultarEnvio(req, res){

    let { reference, transportOrderNumber, rut } = req.body;
    
    //Datos de prueba
    // let reference = "27699451457";
    // let transportOrderNumber = 99726299584;
    // let rut = 77398220;
    // let showTrackingEvents = 1;

    let headers = { "Ocp-Apim-Subscription-Key": tokenDeIntegracionEnvios }

    let data = {
        reference,
        transportOrderNumber,
        rut,
        showTrackingEvents: 1,
    };

    try {
        let response = await axios.post("http://testservices.wschilexpress.com/transport-orders/api/v1.0/tracking", data, { headers })
        //console.log(response.data)
        res.send(response.data)
    } catch (error) {
        res.send(error)
    }   


}

module.exports = {
    consultarEnvio,
    crearEnvio,
    cotizar,
    consultarRegiones,
    consultarCobertura
}