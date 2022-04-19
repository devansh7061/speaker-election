import React from "react";
import img from "./img_avatar.png";

function CandidateCard() {
    return (
      <div class="col-sm-6">
          <div class="card" className="card">
            <img src={img} class="card-img-top" alt="..." />
            <div class="card-body">
              <h5 class="card-title">Card title</h5>
              <p class="card-text">
                Some quick example text to build on the card title and make up
                the bulk of the card's content.
              </p>
              
            </div>
          </div>
        </div>
    );
}

export default CandidateCard;