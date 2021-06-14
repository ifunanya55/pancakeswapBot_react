import React from 'react';
import { Checkbox } from '@material-ui/core';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import ResultViewer from './ResultViewer';
import PaginationTableComponent from './PaginationTableComponent';

const ethers = require('ethers');
const config = require('./config/test.json');
const InputDataDecoder = require('ethereum-input-data-decoder');
const ABI = require('./config/swapABI.json'); // Contract ABI
const decoder = new InputDataDecoder(ABI);
const provider = new ethers.providers.JsonRpcProvider(config[config.network].node);
const wallet = new ethers.Wallet(config[config.network].privateKey, provider);
const account = wallet.connect(provider);
const genericErc20Abi = require("./config/Erc20.json");
const gntABI = require('./config/gntABI.json');

const pancake_route_abi = [
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
];
const pancake_route_contract = new ethers.Contract(config[config.network].addresses.router, pancake_route_abi, provider);

function PancakeswapBot() {

  const [state, setState] = React.useState({
    wbnb: true,
    usdt: false,
    bnb: true,
    busd: true,
    mdx: false,
    cake: false,
    usdc: false,
    resultViewer: ["================== Stop ==================="],
    tableViewer: [" "]
  });

  const resultTemp = [];
  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const start = () => {
    setState({ ...state, resultViewer: "================== Start ===================" });
    pendingTransaction();
  }

  const stop = () => {
    window.location.reload();
    setState({ ...state, resultViewer: "================== Stop ===================" });
  }

  const { resultViewer, wbnb, usdt, bnb, busd, mdx, cake, usdc } = state;

  // const TextFile = async (result) => {
  //   const fileData = JSON.stringify(result);
  //   const blob = new Blob([fileData], { type: "text/plain" });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.download = new Date() + '_swap_result.json';
  //   link.href = url;
  //   link.click();
  // }

  const pendingTransaction = async () => {
    provider.getTransactionCount(config[config.network].addresses.WBNB)
      .then(count => {
        // console.log("count: " + count);
      })
      .catch(err => {
        console.log(err);
      });

    provider.on("block", (blocknumber) => {
      // console.log("blocknumber: " + blocknumber);
      setState({ ...state, resultViewer: "blocknumber: " + blocknumber });
    })

    provider.on("pending", (tx) => {
      // console.log("hash: " + tx.hash);
      setState({ ...state, resultViewer: "token: " + tx.hash });

      provider.getTransaction(tx.hash)
        .then(res => {

          if (res.data !== '0x') {
            var decodeInputResult = decoder.decodeData(res.data);
            if (decodeInputResult.method === "swapExactTokensForTokens") {

              // var to = decodeInputResult.inputs[3];
              // console.log("to: " + to);

              // let tokenIn = decodeInputResult.inputs[2][0]; // WBNB
              // let tokenOut = decodeInputResult.inputs[2][1]; // to_purchase

              // console.log("====tokenIn: " + tokenIn);
              // console.log("==========tokenOut: " + tokenOut);

              let analysisData = new ethers.utils.Interface(pancake_route_abi);
              var data = analysisData.decodeFunctionData('swapExactTokensForTokens', res.data)

              let amountIn = data.amountIn;
              // let amountOutMin = data.amountOutMin;

              let tokenIn = data.path[0];
              let tokenOut = data.path[1];

              let first = '';
              let second = '';

              if (config[config.network].addresses.WBNB === tokenIn) first = "WBNB";
              if (config[config.network].addresses.WBNB === tokenOut) second = "WBNB";
              if (config[config.network].addresses.BNB === tokenIn) first = "BNB";
              if (config[config.network].addresses.BNB === tokenOut) second = "BNB";
              if (config[config.network].addresses.BUSD === tokenIn) first = "BUSD";
              if (config[config.network].addresses.BUSD === tokenOut) second = "BUSD";
              if (config[config.network].addresses.USDC === tokenIn) first = "USDC";
              if (config[config.network].addresses.USDC === tokenOut) second = "USDC";
              if (config[config.network].addresses.USDT === tokenIn) first = "USDT";
              if (config[config.network].addresses.USDT === tokenOut) second = "USDT";
              if (config[config.network].addresses.CAKE === tokenIn) first = "CAKE";
              if (config[config.network].addresses.CAKE === tokenOut) second = "CAKE";
              if (config[config.network].addresses.MDX === tokenIn) first = "MDX";
              if (config[config.network].addresses.MDX === tokenOut) second = "MDX";

              console.log("first: " + first);
              console.log("second: " + second);

              if(first === '')
                console.log("tokeIn: ====" + tokenIn);

              if (
                ((tokenIn === config[config.network].addresses.WBNB && wbnb) || (tokenIn === config[config.network].addresses.BNB && bnb)
                  || (tokenIn === config[config.network].addresses.USDT && usdt) || (tokenIn === config[config.network].addresses.BUSD && busd)
                  || (tokenIn === config[config.network].addresses.MDX && mdx) || (tokenIn === config[config.network].addresses.CAKE && cake)
                  || (tokenIn === config[config.network].addresses.USDC && usdc))
                // &&
                // ((tokenOut === config[config.network].addresses.WBNB && wbnb) || (tokenOut === config[config.network].addresses.BNB && bnb)
                //   || (tokenOut === config[config.network].addresses.USDT && usdt) || (tokenOut === config[config.network].addresses.BUSD && busd)
                //   || (tokenOut === config[config.network].addresses.MDX && mdx) || (tokenOut === config[config.network].addresses.CAKE && cake)
                //   || (tokenOut === config[config.network].addresses.USDC && usdc))
              ) {

                let firstAddress = null;

                if(first === "WBNB") firstAddress = config[config.network].addresses.WBNB;
                if(first === "BNB") firstAddress = config[config.network].addresses.BNB;
                if(first === "USDT") firstAddress = config[config.network].addresses.USDT;
                if(first === "USDC") firstAddress = config[config.network].addresses.USDC;
                if(first === "CAKE") firstAddress = config[config.network].addresses.CAKE;
                if(first === "MDX") firstAddress = config[config.network].addresses.MDX;
                if(first === "BUSD") firstAddress = config[config.network].addresses.BUSD;

                const contractBalance = new ethers.Contract(firstAddress, genericErc20Abi, provider);
                contractBalance.balanceOf(firstAddress)
                  .then(balance => {

                    console.log("amountIn ==== " + first + " ======== " + amountIn);
                    console.log("balance ====== " + first + " ========== " + balance);

                    if (balance >= amountIn) {
                      console.log("=========== swap ================");

                      // provider.getGasPrice().then((currentGasPrice) => {
                      //   let gas_price = ethers.utils.hexlify(parseInt(currentGasPrice));
                      // console.log(`gas_price: ${gas_price}`);

                      setState({ ...state, resultViewer: "================= Buy ====================" });
                      swapTokens(tokenIn, tokenOut, amountIn);

                      resultTemp.push("============== Buy ================");
                      resultTemp.push(new Date());
                      resultTemp.push(first);
                      resultTemp.push(second);

                      const amountOut = pancake_route_contract.getAmountsOut(amountIn, [tokenIn, tokenOut]);

                      setState({ ...state, resultViewer: "================= Sell ====================" });
                      swapTokens(tokenOut, tokenIn, amountOut);

                      resultTemp.push("============== Sell ================");
                      resultTemp.push(new Date());
                      resultTemp.push(second);
                      resultTemp.push(first);

                      setState({ ...state, tableViewer: {resultTemp} });

                      // TextFile(resultTemp);
                      // });
                    } else {
                      console.log("Balance is not Enough.");
                    }
                  })
              }
            } else {
              // console.log("This is not a swapExactTokensForTokens.");
            }
          }
        })
    })
  }

  const swapTokens = async (tokenIn, tokenOut, amountIn) => {

    const amountOut = await pancake_route_contract.getAmountsOut(amountIn, [tokenIn, tokenOut]);
    // Operating Smart contract
    // const pancake_route_address = "0x10ed43c718714eb63d5aa57b78b54704e256024e";
    // The ERC-20 Contract ABI, which is a common contract interface
    // for tokens (this is the Human-Readable ABI format)

    // const pancake_route_contract = new ethers.Contract(pancake_route_address, pancake_route_abi, provider);
    // const signer = pancake_route_contract.connect(wallet);
    // const amountIn = ethers.utils.parseUnits("0.01", 18);
    // const amountOut = ethers.utils.parseUnits("3.40292", 18);
    // const address = ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", "0xe9e7cea3dedca5984780bafc599bd69add087d56"];
    const address = [tokenIn, tokenOut];
    const to = config[config.network].addresses.recipient;

    try {
      // const wbnb_address = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
      const wbnb_abi = [
        'function approve(address spender, uint256 amount) external returns (bool)'
      ];
      // const wbnb_contract = new ethers.Contract(wbnb_address, wbnb_abi, provider);
      // const signer = wbnb_contract.connect(wallet);
      // var options = { gasPrice: 5000000000, gasLimit: 44264, nonce: 1990, value: 0 };

      let iface = new ethers.utils.Interface(wbnb_abi);
      var data = iface.encodeFunctionData('approve', [config[config.network].addresses.router, ethers.BigNumber.from("115792089237316195423570985008687907853269984665640564039457584007913129639935")]);

      const txObj =
      {
        from: config[config.network].addresses.recipient,
        to: tokenIn,
        value: 0,
        gasLimit: 144264, // 100000
        gasPrice: 7000000000,
        data: data,
      }

      try {
        //signedTx = await account.signTransaction(txObj);
        account.sendTransaction(txObj).then((transaction) => {
          console.dir(transaction);
          console.log('====================== Approve Send finished! ================= ');

          let iface = new ethers.utils.Interface(pancake_route_abi);
          var data = iface.encodeFunctionData('swapExactTokensForTokens', [amountIn, amountOut, address, to, Date.now() + 1000 * 60 * 5]);
          // var aaa = iface.decodeFunctionData('swapExactTokensForTokens', data)
          // console.dir(aaa);
          const txObj =
          {
            from: config[config.network].addresses.recipient,
            to: config[config.network].addresses.router,
            value: 0,
            gasLimit: 144264, // 100000
            gasPrice: 7000000000,
            data: data,
          }

          try {
            //signedTx = await account.signTransaction(txObj);
            setTimeout(() => {
              account.sendTransaction(txObj).then((transaction) => {
                console.dir(transaction);
                console.log('====================== Swap Send finished! ================= ');
              });
            }, 3000);
          } catch (error) {
            console.log("failed to send!!");
          }
        });
      } catch (error) {
        console.log("failed to send!!");
      }

      //tx = await signer.approve("0x10ed43c718714eb63d5aa57b78b54704e256024e", ethers.BigNumber.from("115792089237316195423570985008687907853269984665640564039457584007913129639935"));
      //console.log(tx.hash);
    } catch (err) {
      console.log(err)
    }
  }

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });

  process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection', {
      unhandledRejection: p,
      reason,
    });
  });

  return (
    <div className="containLayout">
      <p className="title">Please select your tokens for pancakeswap!</p>

      <FormGroup>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4}>
            <div>
              <FormControlLabel
                control={<Checkbox checked={wbnb} onChange={handleChange} name="wbnb" />}
                label="WBNB"
              />
            </div>
            <div>
              <FormControlLabel
                control={<Checkbox checked={usdc} onChange={handleChange} name="usdc" />}
                label="USDC"
              />
            </div>
            <div>
              <FormControlLabel
                control={<Checkbox checked={usdt} onChange={handleChange} name="usdt" />}
                label="USDT"
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={4}>
            <div>
              <FormControlLabel
                control={<Checkbox checked={bnb} onChange={handleChange} name="bnb" />}
                label="BNB"
              />
            </div>
            <div>
              <FormControlLabel
                control={<Checkbox checked={mdx} onChange={handleChange} name="mdx" />}
                label="MDX"
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={4}>
            <div>
              <FormControlLabel
                control={<Checkbox checked={busd} onChange={handleChange} name="busd" />}
                label="BUSD"
              />
            </div>
            <div>
              <FormControlLabel
                control={<Checkbox checked={cake} onChange={handleChange} name="cake" />}
                label="CAKE"
              />
            </div>
          </Grid>
        </Grid>
      </FormGroup>
      <div className="buttons">
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Button variant="contained" color="secondary" onClick={start}>
              Start
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button variant="contained" color="secondary" onClick={stop}>
              Stop
            </Button>
          </Grid>
        </Grid>
      </div>
      <div className="resultViewer">
        <ResultViewer data={resultViewer} />
      </div>
      {/* <PaginationTableComponent data={tableViewer}/> */}
    </div>
  );
}

export default PancakeswapBot;