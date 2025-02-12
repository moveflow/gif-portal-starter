const anchor = require('@project-serum/anchor');

// Need the system program, will talk about this soon.
const { SystemProgram } = anchor.web3;

const main = async() => {
    console.log("🚀 Starting test...")

    // Create and set the provider. We set it before but we needed to update it, so that it can communicate with our frontend!
    const provider = anchor.Provider.env();
    anchor.setProvider(provider);
    console.log("ping")
    const program = anchor.workspace.Myepicproject;
    console.log("ping")
    // Create an account keypair for our program to use.
    const baseAccount = anchor.web3.Keypair.generate();

    console.log("ping")

    // Call start_stuff_off, pass it the params it needs!
    let tx = await program.rpc.startStuffOff({
        accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
    });

    console.log("📝 Your transaction signature", tx);

    // Fetch data from the account.
    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('👀 GIF Count', account.totalGifs.toString())

    // You'll need to now pass a GIF link to the function! You'll also need to pass in the user submitting the GIF!
    await program.rpc.addGif("insert_a_giphy_link_here", {
        accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
        },
    });

    // Call the account.
    account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('👀 GIF Count', account.totalGifs.toString())

    // Access gif_list on the account!
    console.log('👀 GIF List', account.gifList)

    console.log("ping")
    await program.rpc.likeGif(0, {
        accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
        },
    });
    console.log("pong")
    account = await program.account.baseAccount.fetch(baseAccount.publicKey);


    // Access gif_list on the account!
    console.log('👀 GIF List', account.gifList)
}

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

runMain();