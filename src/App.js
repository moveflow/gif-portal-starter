import React, { useEffect, useState } from 'react';
import kp from './keypair.json'
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {
    Program, Provider, web3
} from '@project-serum/anchor';

import idl from './idl.json';

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
    preflightCommitment: "processed"
}
// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const TEST_GIFS = [
    'https://media.giphy.com/media/0Zcsj2NpfGDljTgsya/giphy.gif',
    'https://media.giphy.com/media/NRPFpSPJbve80/giphy.gif',
    'https://media.giphy.com/media/Uym0t0fjk70h2OGz1E/giphy.gif',
    'https://media.giphy.com/media/xT8qBlLIqUgp1zKsb6/giphy.gif',
    'https://media.giphy.com/media/XRt9B6fRO4mmQ/giphy.gif',
    'https://media.giphy.com/media/1jl11DWVzH5KHpJ8Hz/giphy.gif'
]

const App = () => {

    // State
    const [walletAddress, setWalletAddress] = useState(null);

    const [inputValue, setInputValue] = useState('');

    const [gifList, setGifList] = useState([]);

    // Actions
    const checkIfWalletIsConnected = async () => {
        try {
            const { solana } = window;

            if (solana) {
                if (solana.isPhantom) {
                    console.log('Phantom wallet found!');
                    const response = await solana.connect({ onlyIfTrusted: true });
                    console.log(
                        'Connected with Public Key:',
                        response.publicKey.toString()
                    );
                    /*
                     * Set the user's publicKey in state to be used later!
                     */
                    setWalletAddress(response.publicKey.toString());
                }
            } else {
                alert('Solana object not found! Get a Phantom Wallet 👻');
            }
        } catch (error) {
            console.error(error);
        }
    };

    /*
     * Let's define this method so our code doesn't break.
     * We will write the logic for this next!
     */
    const connectWallet = async () => {
        const { solana } = window;

        if (solana) {
            const response = await solana.connect();
            console.log('Connected with Public Key:', response.publicKey.toString());
            setWalletAddress(response.publicKey.toString());
        }
    };

    const sendGif = async () => {
        if (inputValue.length === 0) {
            console.log("No gif link given!")
            return
        }
        setInputValue('');
        console.log('Gif link:', inputValue);
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);

            await program.rpc.addGif(inputValue, {
                accounts: {
                    baseAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                },
            });
            console.log("GIF successfully sent to program", inputValue)

            await getGifList();
        } catch (error) {
            console.log("Error sending GIF:", error)
        }
    };

    const onInputChange = (event) => {
        const { value } = event.target;
        setInputValue(value);
    };

    const getProvider = () => {
        const connection = new Connection(network, opts.preflightCommitment);
        const provider = new Provider(
            connection, window.solana, opts.preflightCommitment,
        );
        return provider;
    }

    /*
     * We want to render this UI when the user hasn't connected
     * their wallet to our app yet.
     */
    const renderNotConnectedContainer = () => (
        <button
            className="cta-button connect-wallet-button"
            onClick={connectWallet}
        >
            Connect to Wallet
        </button>
    );

    const smokeOne = async (index) => {
        console.log("smoke one",index)
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);

            await program.rpc.likeGif(index, {
                accounts: {
                    baseAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                },
            });
            console.log("GIF successfully smoked in program", index)

            await getGifList();
        } catch (error) {
            console.log("Error smoking GIF:", error)
        }
    }

    const renderConnectedContainer = () => {
// If we hit this, it means the program account hasn't been initialized.
        if (gifList === null) {
            return (
                <div className="connected-container">
                    <button className="cta-button submit-gif-button" onClick={createGifAccount}>
                        Do One-Time Initialization For GIF Program Account
                    </button>
                </div>
            )
        }
        // Otherwise, we're good! Account exists. User can submit GIFs.
        else {
            return(
                <div className="connected-container">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            sendGif();
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Enter gif link!"
                            value={inputValue}
                            onChange={onInputChange}
                        />
                        <button type="submit" className="cta-button submit-gif-button">
                            Submit
                        </button>
                    </form>
                    <div className="gif-grid">
                        {/* We use index as the key instead, also, the src is now item.gifLink */}
                        {gifList.map((item, index) => (
                            <div className="gif-item" key={index}>
                                <img src={item.gifLink} />
                                <button type="submit" className="smoke-button" onClick={()=>smokeOne(index)}>
                                    🚬
                                </button>
                                <div className="red">{item.userAddress.toString()}</div>
                                <div className="red">smokes already {item.likes.toString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    }

    const createGifAccount = async () => {
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);
            console.log("ping")
            await program.rpc.startStuffOff({
                accounts: {
                    baseAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                },
                signers: [baseAccount]
            });
            console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
            await getGifList();

        } catch(error) {
            console.log("Error creating BaseAccount account:", error)
        }
    }

    // UseEffects
    useEffect(() => {
        const onLoad = async () => {
            await checkIfWalletIsConnected();
        };
        window.addEventListener('load', onLoad);
        return () => window.removeEventListener('load', onLoad);
    }, []);

    const getGifList = async() => {
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);
            const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

            console.log("Got the account", account)
            setGifList(account.gifList)

        } catch (error) {
            console.log("Error in getGifList: ", error)
            setGifList(null);
        }
    }

    useEffect(() => {
        if (walletAddress) {
            console.log('Fetching GIF list...');
            getGifList()
            // console.log('Fetching GIF list...');

            // Call Solana program here.

            // Set state
            // setGifList(TEST_GIFS);
        }
    }, [walletAddress]);

    return (
        <div className="App">
            {/* This was solely added for some styling fanciness */}
            <div className={walletAddress ? 'authed-container' : 'container'}>
                <div className="header-container">
                    <p className="header">🚬 the ash try collection <span className="mirror">🚬</span></p>
                    <p className="sub-text">
                        🔥 go and light one up <span className="mirror">🔥</span>
                    </p>
                    {/* Add the condition to show this only if we don't have a wallet address */}
                    {!walletAddress && renderNotConnectedContainer()}
                    {/* We just need to add the inverse here! */}
                    {walletAddress && renderConnectedContainer()}
                </div>
                {/*<div className="footer-container">*/}
                {/*    <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />*/}
                {/*    <a*/}
                {/*        className="footer-text"*/}
                {/*        href={TWITTER_LINK}*/}
                {/*        target="_blank"*/}
                {/*        rel="noreferrer"*/}
                {/*    >{`built on @${TWITTER_HANDLE}`}</a>*/}
                {/*</div>*/}
            </div>
        </div>
    );
};


export default App;