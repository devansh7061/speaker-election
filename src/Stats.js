import React, { Component } from "react";
import VotingContract from "./contracts/VotingContract.json";
import getWeb3 from "./getWeb3";
import { FormGroup, FormControl, Button } from "react-bootstrap";
import Navbar from "./Navbar";
import NavbarAdmin from "./NavbarAdmin";

class Stats extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    toggle: false,
    votesCasted: "",
    totalAbstain: "",
    totalReject: "",
    candidateVoteList: null,
    start: false,
    isOwner: false,
  };

  votesCasted = async () => {
    let votesCasted = await this.state.VotingInstance.methods
      .totalVotesCasted()
      .call();
    this.setState({ votesCasted: votesCasted });
  };

  totalAbstain = async () => {
    let totalAbstain = await this.state.VotingInstance.methods
      .totalAbstain()
      .call();
    this.setState({ totalAbstain: totalAbstain });
  };

  totalReject = async () => {
    let totalReject = await this.state.VotingInstance.methods
      .totalReject()
      .call();
    this.setState({ totalReject: totalReject });
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

      let candidateCount = await this.state.VotingInstance.methods
        .getCandidateCount()
        .call();

      let candidateList_ = [];
      for (let i = 0; i < candidateCount; i++) {
        let candidate = await this.state.VotingInstance.methods
          .candidateDetails(i)
          .call();
        candidateList_.push(candidate);
      }
      this.setState({ candidateList: candidateList_ });

      const owner = await this.state.VotingInstance.methods.getOwner().call();
      if (this.state.account === owner) {
        this.setState({ isOwner: true });
        this.votesCasted();
        this.totalAbstain();
        this.totalReject();
      }

      let start = await this.state.VotingInstance.methods
        .electionStatus()
        .call();

      this.setState({ start: start });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };
  render() {
    let candidateList_;
    if (this.state.candidateList) {
      candidateList_ = this.state.candidateList.map(
        (candidate, candidateId) => {
          return (
            <div className="candidate" key={candidateId}>
              <div className="h5 winner">
                <p>{candidate.name}</p>
                <p>Candidate ID : {candidate.candidateId}</p>
                <div>Votes : {candidate.voteCount}</div>
              </div>
              <br></br>
            </div>
          );
        }
      );
    }

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    if (!this.state.isOwner) {
      return (
        <div>
          {this.state.isOwner ? <NavbarAdmin /> : <Navbar />}
          <div>
            <h1>ONLY ADMIN CAN ACCESS</h1>
          </div>
        </div>
      );
    }
    if (this.state.start) {
      return (
        <>
          <NavbarAdmin />
          <div className="CandidateDetails">
            <div className="CandidateDetails-title">
              <h1>Voting is still going on.</h1>
            </div>
          </div>
        </>
      );
    }

    return (
      <div className="background-blue">
        <NavbarAdmin />
        <br></br>
        <div className="h5 winner">
          <p>Total votes casted {this.state.votesCasted}</p>
        </div>
        <br></br>
        <div>{candidateList_}</div>
        <br></br>
        <div className="h5 winner">
          <p>Abstained {this.state.totalAbstain}</p>
        </div>
        <br></br>
        <div className="h5 winner">
          <p>Rejected {this.state.totalReject}</p>
        </div>
      </div>
    );
  }
}

export default Stats;
