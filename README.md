# Sonra

> Wovon man nicht sprechen kann, darüber muss man schweigen

Sonra is a codegen library for Ethereum web applications for a better type
driven development experience. It solves a coordination problem between contract
addresses, metadata and interfaces enabling users to have a cleaner api to build
their web application on. It also introduces a rigourous type first approach
which is exemplified by the custom ~Address~ type which uses type branding to
guard as a constrained string.

Sonra extends the granularity in which developers can describe smart contract
systems and how they can relate to each other.

## Address

The `Address` type is an
