const WebpayPlus = require("transbank-sdk").WebpayPlus;
const Options = require("transbank-sdk").Options;
const IntegrationCommerceCodes = require("transbank-sdk").IntegrationCommerceCodes;
const IntegrationApiKeys = require("transbank-sdk").IntegrationApiKeys;
const Environment = require("transbank-sdk").Environment;

// Versión 3.x del SDK
const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));


//Endpoint GET
async function nuevoPago(req,res) {
    // let { precio: amount } = req.body;
    let amount = 10500;
    let buyOrder = 'B-319823109283109283';
    let sessionId = 'S-93841093874017342'; 
    let returnUrl = req.protocol +  '://' + req.get('host') + "/confirmarPago";
    
    let response = await tx.create(buyOrder, sessionId, amount, returnUrl);
    let { url, token } = response;

    let respuesta = url + `?token_ws=${token}`;
    res.send(`
    <html>
        <h2>Pagar ${amount}</h2>
        <form method="post" action="${url}">
        <input type="hidden" name="token_ws" value="${token}" />
        <input type="submit" value="Ir a pagar" />
        </form>
    </html>
`)
}


//Endpoint POST
//Flujos:
  //1. Flujo normal (OK): solo llega token_ws
  //2. Timeout (más de 10 minutos en el formulario de Transbank): llegan TBK_ID_SESION y TBK_ORDEN_COMPRA
  //3. Pago abortado (con botón anular compra en el formulario de Webpay): llegan TBK_TOKEN, TBK_ID_SESION, TBK_ORDEN_COMPRA
  //4. Caso atipico: llega todos token_ws, TBK_TOKEN, TBK_ID_SESION, TBK_ORDEN_COMPRA
async function confirmarPago(req,res) {
    let params = req.method === 'GET' ? req.query : req.body;

    let token_ws = params.token_ws;
    let tbkToken = params.TBK_TOKEN;
    let tbkOrdenCompra = params.TBK_ORDEN_COMPRA;
    let tbkIdSesion = params.TBK_ID_SESION;
    

    if (token_ws && !tbkToken) {//Flujo 1
        const commitResponse = await (new WebpayPlus.Transaction()).commit(token_ws);

        res.send(`Confirmar Transaccion: ${commitResponse}`)
        
    }
    else if (!token_ws && !tbkToken) {//Flujo 2
        res.send("El pago fue anulado por tiempo de espera.")
      }
      else if (!token_ws && tbkToken) {//Flujo 3
        res.send("El pago fue anulado por el usuario.")
      }
      else if (token_ws && tbkToken) {//Flujo 4
        res.send("El pago es inválido.")
    }
    //response contiene:
    /*
        response.vci
        response.amount
        response.status
        response.buy_order
        response.session_id
        response.card_detail
        response.accounting_date
        response.transaction_date
        response.authorization_code
        response.payment_type_code
        response.response_code
        response.installments_amount
        response.installments_number
        response.balance
    */
}


module.exports = {
    nuevoPago,
    confirmarPago,
}