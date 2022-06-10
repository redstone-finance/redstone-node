# Offchain aggregation specification

## Intro

### RedStone oracles
As you already know, we at RedStone build the new generation of oracles. The main difference between RedStone and other oracles is based on the data delivery model. Instead of repeatedly pushing data to blockchains, RedStone nodes (data providers) sign data using their private keys and broadcast the signed data packages to the decentralized cache layer (e.g. [streamr network](https://streamr.network/)). Then, any user, which wants to send a contract interation that relies on RedStone data, needs to pull data from the decentralized cache layer and attach it to their blockchain transaction. A contract can verify the data integrity using cryptographic signatures and the timestamp. You can find much more info here: https://github.com/redstone-finance/redstone-evm-connector/blob/master/README.md

### Scalability challenge
Note, that current RedStone nodes are independent, which means that they don't communicate with each other.
So, if you want to require at least 5 independetnt data signers in your smart contract, then each user transactions should contain at least 5 signed data packages. Unfortunately, gas calculation algorithm in EVM works makes this approach too expensive, because gas consumption grows much faster than linearly comparing to the number of data packages.

### Proposed solution - the oracle network
We want to resolve the scalability issue by creating a real oracle network with the nodes that communicate with each other and repeatedly (in each epoch) caclulate the consolidated value. After calculating the consolidated value, each node should independently sign it and broadcast to the decentralized cache layer. Thanks to this, users will be able to send transactions (that require X unique signers of oracle data) attaching only one data package and X unique signatures. It will decrease the gas costs and make the solution much more scalable.

## Specification of the oracle network

### Main assumptions
- Each node has its private key
- Each node knows public keys and ip addresses of all other nodes in the network
- The oracle network should calculate the consolidated value for each epoch
- Each epoch time is 10 seconds (epoch start times can be described using cron schedule expressions as `"*/10 * * * * *"`)
- Consolidated value for a given epoch is the median value of all valid proposed values for the given epoch from all nodes in the network. E.g. if in the 42th epoch, node 1 proposed value 99, node 2 - value 101, and node 3 - value 100, then the aggregated value for the 42th epoch is 100
- After the consolidated value calculation, each node should know it, then each node should sign it using its private key and broadcast it to the Decentralized Cache layer

### Requirements
- Communication between nodes should be secure
- The network should be resistant to DDoS attacks
- The oracle network should be stable (should work correctly even if some nodes stop working)
- The oracle network should be secure (should work correctly even if <50% nodes act as adversaries)
- It should be possible to prove that some node misbehaved at some time (stopped working or started malicious activities). This prove will be used for the reputation calculation

## Task description

Our main goal with this task is to simulate the real work, which means that after joining RedStone you would probably receive similar tasks and the work would be organised in the similar way. It should help both of us to understand if we can efficiently collborate.

The task can be splitted in the following steps.

### 1. Research
During the real work, you are open to use any public information, so now you can also do any research and analyze similar projects or already existing solutions. There are bonus points for finding new requirements, that are missed in your opinion :)

### 2. Finalize the specification (discuss it with us)
In the next step you should finalize the specification and describe the network algorithm in details. 

Ideally, if during this step we can communicate and will go through few iterations until finding the best solution.

You can contact me:
- On discord: https://redstone.finance/discord (the best and the most responsive way)
- Or via email: alex@redstone.finance

By the end of the second step you should be able to answer the following questions:
- What protocols should be used for the communication between nodes?
- How should the networking algorithm work?
- How to satisfy all the provided requirements for the network?

### 3. Implement a Proof of Concept
In the final step of the task you should implement an extremely simplified proof of concept. Majority of things (cryptography, proposed value fetching, data broadcasting, nodes details fetching) can be mocked in the proof of concept, but the main logic of the network operation should be implemented. You can use any technology you want for the PoC, but we'd prefer Node.js or Rust.

There will be bonus points for implementing tests for the proof of concept :)

Good luck!
