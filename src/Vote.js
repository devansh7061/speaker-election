import React, { Component } from "react";
import VotingContract from "./contracts/VotingContract.json";
import getWeb3 from "./getWeb3";
import Navbar from "./Navbar";
import NavbarAdmin from "./NavbarAdmin";
import { FormGroup, FormControl, Button, Card } from "react-bootstrap";
import img from "./img_avatar.png";
import Sumit from "./Sumit.jpeg";
import Girish from "./Girish.jpeg";

class Vote extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    isOwner: false,
    start: false,
    myAccount: null,
    candidateId: "",
    candidateLists: null,
  };
  updateCandidateId = (event) => {
    this.setState({ candidateId: event.target.value });
  };

  vote = async () => {
    await this.state.VotingInstance.methods
      .vote(this.state.candidateId)
      .send({ from: this.state.account });
    window.location.reload(false);
  };

  abstain = async () => {
    await this.state.VotingInstance.methods
      .abstain()
      .send({ from: this.state.account });
    window.location.reload(false);
  };

  reject = async () => {
    await this.state.VotingInstance.methods
      .reject()
      .send({ from: this.state.account });
    window.location.reload(false);
  };

  componentDidMount = async () => {
    // FOR REFRESHING PAGE ONLY ONCE -
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }

    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = VotingContract.networks[networkId];
      const instance = new web3.eth.Contract(
        VotingContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.

      this.setState({
        VotingInstance: instance,
        web3: web3,
        account: accounts[0],
      });

      let myAccount = await this.state.VotingInstance.methods.voterAddresses(
        this.state.accounts
      );
      this.setState({ myAccount: myAccount });

      let candidateCount = await this.state.VotingInstance.methods
        .getCandidateCount()
        .call();

      let candidateList = [];
      for (let i = 0; i < candidateCount; i++) {
        let candidate = await this.state.VotingInstance.methods
          .candidateDetails(i)
          .call();
        candidateList.push(candidate);
      }
      this.setState({ candidateLists: candidateList });

      let start = await this.state.VotingInstance.methods
        .electionStatus()
        .call();

      this.setState({ start: start });

      const owner = await this.state.VotingInstance.methods.getOwner().call();
      if (this.state.account === owner) {
        this.setState({ isOwner: true });
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {
    let candidateList;
    if (this.state.candidateLists) {
      candidateList = this.state.candidateLists.map(
        (candidate, candidateId) => {
          return (
            <div className="candidate" key={candidateId}>
              <img src={candidate.name} className="img-cand" alt="..." />
              <h5 className="candidateName">{candidate.name}</h5>
              <div className="candidateDetails">
                <div>Candidate ID : {candidate.candidateId}</div>
                <div>Details : {candidate.details}</div>
              </div>
              <br></br>
              <br></br>
            </div>
          );
        }
      );
    }

    if (!this.state.web3) {
      return (
        <div className="CandidateDetails">
          <div className="CandidateDetails-title">
            <h1>Loading Web3, accounts, and contract..</h1>
          </div>
          {this.state.isOwner ? <NavbarAdmin /> : <Navbar />}
        </div>
      );
    }

    if (!this.state.start) {
      return (
        <div className="CandidateDetails">
          {this.state.isOwner ? <NavbarAdmin /> : <Navbar />}
          <div className="CandidateDetails-title">
            <h1>VOTING HAS NOT STARTED YET.</h1>
          </div>

          <div className="CandidateDetails-sub-title">
            Please Wait.....While election starts !
          </div>
        </div>
      );
    }

    // if (this.state.myAccount) {
    //   if (!this.state.myAccount.isVerified) {
    //     return (
    //       <div className="CandidateDetails">
    //         <div className="CandidateDetails-title">
    //           <h1>You need to verified first for voting.</h1>
    //         </div>

    //         <div className="CandidateDetails-sub-title">
    //           Please wait....the verification can take time
    //         </div>
    //         {this.state.isOwner ? <NavbarAdmin /> : <Navbar />}
    //       </div>
    //     );
    //   }
    // }

    if (this.state.myAccount) {
      if (this.state.myAccount.hasVoted) {
        return (
          <div className="CandidateDetails">
            <div className="CandidateDetails-title">
              <h1>YOU HAVE SUCCESSFULLY CASTED YOUR VOTE</h1>
            </div>
            {this.state.isOwner ? <NavbarAdmin /> : <Navbar />}
          </div>
        );
      }
    }

    return (
      <div className="App text-center background-blue">
        {/* <div>{this.state.owner}</div> */}
        {/* <p>Account address - {this.state.account}</p> */}
        {this.state.isOwner ? <NavbarAdmin /> : <Navbar />}
        <div className="CandidateDetails">
          <div className="CandidateDetails-title">
            <h1>VOTE</h1>
          </div>
        </div>

        <div className="form">
          <FormGroup>
            <div className="form-label">
              Enter Candidate ID you want to vote{" "}
            </div>
            <div className="form-input">
              <FormControl
                input="text"
                value={this.state.candidateId}
                onChange={this.updateCandidateId}
              />
            </div>

            <div className="row">
              <div className="col-md-4 mb-4 text-center">
                <Button onClick={this.vote} className="button-vote">
                  Vote
                </Button>
              </div>
              <div className="col-md-4 mb-4 text-center">
                <Button
                  onClick={this.abstain}
                  className="button-vote"
                  variant="secondary"
                >
                  Abstain
                </Button>
              </div>
              <div className="col-md-4 mb-4 text-center">
                <Button
                  onClick={this.reject}
                  className="button-vote"
                  variant="danger"
                >
                  Reject
                </Button>
              </div>
            </div>
          </FormGroup>
        </div>
        <br></br>

        {/* <Button onClick={this.getCandidates}>
              Get Name
            </Button> */}

        {this.state.toggle ? (
          <div>You can only vote to your own constituency</div>
        ) : (
          ""
        )}

        <div>
          <div className="candidate">
            <img src={Sumit} className="img-cand" alt="..." />
            <h5 className="candidateName">Sumit Singh Patel</h5>
            <div className="candidateDetails">
              <div>Candidate ID : 0</div>
              <div>Details : CE19B094</div>
            </div>
            <br></br>
            <br></br>
          </div>
          <div className="candidate">
            <img src={Girish} className="img-cand" alt="..." />
            <h5 className="candidateName">Girish Mahawar</h5>
            <div className="candidateDetails">
              <div>Candidate ID : 1</div>
              <div>Details : ME18B107</div>
            </div>
            <br></br>
            <br></br>
          </div>
        </div>
      </div>
    );
  }
}

export default Vote;
