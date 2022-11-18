import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Coffee from "../assets/coffee.gif";
import abi from "../utils/abi.json";

// Constants
// Contract Address & ABI
const contractAddress = "0x709019bdAf0B5384609DC9f27Ab4517E1B7ca6f5";
const contractABI = abi;

const Header = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [tip, setTip] = useState(0.005);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleTipChange = (event) => {
    setTip(event.target.value);
  };

  const connectWallet = async () => {
    try {
      const provider = window?.coinbaseWalletExtension || window?.ethereum;

      if (!provider) {
        console.log("please install MetaMask");
        window.location.assign("https://metamask.io/")
      }

      await provider.request({
        method: "eth_requestAccounts",
      });
      
      const chainId = await provider.request({ method: "eth_chainId" });
      
      if (chainId !== "0x1") {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x1" }],
        });
      }
      setIsConnected(true);
    } catch (error) {
      console.log(error);
    }
  };

  const buyCoffee = async (e) => {
    e.preventDefault();
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther(tip.toString()) }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    window.ethereum.on('accountsChanged', () => {
      window.location.replace(window.location.pathname)
    })
  }, []);

  return (
    <header className="side-header flex items-center justify-end">
      {isConnected ? (
        <form
          onSubmit={buyCoffee}
          className="flex items-center justify-end header--form"
        >
          <div className="header--brand">
            <img src={Coffee} alt="" />
          </div>
          <button type="submit" className="brand--btn mx-4 p-3 rounded-md">
            Buy me a coffee
          </button>
          <div>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your Name"
              className="border mx-3 p-2 rounded-md"
              value={name}
              onChange={handleNameChange}
            />
          </div>
          <div>
            <input
              id="message"
              name="message"
              type="text"
              placeholder="Your message"
              className="border mx-3 p-2 rounded-md"
              value={message}
              onChange={handleMessageChange}
            />
          </div>
          <div className="relative">
            <input id="tip" name="tip" type="number" placeholder="Tip" className="border mx-3 p-2 rounded-md pr-8"  value={tip} onChange={handleTipChange} />
            <label htmlFor="tip" className="tip--label">Ether</label>
          </div>
        </form>
      ) : (
        <div>
           <button type="button" className="brand--btn mx-4 p-3 rounded-md" onClick={connectWallet}>Connect wallet</button>
        </div>
      )}
    </header>
  );
};

export default Header;
