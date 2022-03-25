use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("iMbkbxLVQTcikxQfagBQNwYmvLbeJ62A61d7aRryibJ");

#[program]
pub mod myepicproject {
    use super::*;
    pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> ProgramResult {
        // Get a reference to the account.
        let base_account = &mut ctx.accounts.base_account;
        // Initialize total_gifs.
        base_account.total_gifs = 0;
        Ok(())
    }

    pub fn like_gif(ctx: Context<AddGif>, gif_addr: i32) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let _user = &mut ctx.accounts.user;
        let mut item =  base_account.gif_list.get_mut(gif_addr as usize).unwrap();
        item.likes += 1;
        // base_account.gif_list.get_mut(0).unwrap().likes += 1;
        Ok(())
    }

    // The function now accepts a gif_link param from the user. We also reference the user from the Context
    pub fn add_gif(ctx: Context<LikeGif>, gif_link: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let user = &mut ctx.accounts.user;

        // Build the struct.
        let item = ItemStruct {
            likes: 0,
            gif_link: gif_link.to_string(),
            user_address: *user.to_account_info().key,
            index: base_account.total_gifs,
        };

        // Add it to the gif_list vector.
        base_account.gif_list.push(item);
        // base_account.gif_map.insert(gif_link.to_string(),item);
        base_account.total_gifs += 1;
        Ok(())
    }
}

// Attach certain variables to the StartStuffOff context.
#[derive(Accounts)]
pub struct StartStuffOff<'info> {
    #[account(init, payer = user, space = 9000)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
}

// Specify what data you want in the AddGif Context.
// Getting a handle on the flow of things :)?
// Add the signer who calls the AddGif method to the struct so that we can save it
#[derive(Accounts)]
pub struct AddGif<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct LikeGif<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

// Create a custom struct for us to work with.
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ItemStruct {
    pub likes: u64,
    pub gif_link: String,
    pub user_address: Pubkey,
    pub index: u64,
}

// Tell Solana what we want to store on this account.
#[account]
pub struct BaseAccount {
    pub total_gifs: u64,
    // Attach a Vector of type ItemStruct to the account.
    pub gif_list: Vec<ItemStruct>,
    // pub gif_map: HashMap<String,ItemStruct>
}