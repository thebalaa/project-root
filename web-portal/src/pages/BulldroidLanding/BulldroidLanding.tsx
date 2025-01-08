import React from 'react';
import './BulldroidLanding.css';

const BulldroidLanding: React.FC = () => {
  return (
    <div className="bulldroid-landing">
      {/* Minimalistic sci-fi layout, referencing template.md content */}

      <section className="hero-section">
        <h1>Meet Bulldroid 🐾</h1>
        <h2>AI Automated Trading Bot Specializing in Bulldog Care!</h2>
      </section>

      <section className="content-section">
        <h3>🚀 What Can Bulldroid Do?</h3>
        <h4>Track & Reward Pet Care</h4>
        <p>
          Record your pet's health activities, such as feeding, exercise,
          grooming, and vet visits. Earn AstroBones Tokens for taking
          excellent care of your pet. Turn your love and effort into
          galactic rewards.
        </p>
        <h4>Crypto-Fueled Wealth Building</h4>
        <p>
          Deposit cryptocurrency, and Bulldroid will autonomously trade on
          behalf of the Bulldog Galactic Federation. 50% of the profits from
          trading will be distributed back to investors, and the other 50%
          will be added to the AstroBones liquidity pool.
        </p>
        <p>
          Help grow the Federation’s wealth while supporting initiatives
          that benefit dogs across the galaxy.
        </p>
        <h4>Expert Bulldog Care Guidance</h4>
        <p>
          Receive up-to-date insights and tips on how to care for your dog,
          with a special focus on bulldogs. From nutrition to exercise and
          breed-specific health advice, Bulldroid ensures you have all the
          knowledge to keep your pet happy and healthy.
        </p>
      </section>

      <section className="content-section">
        <h3>💰 AstroBones Tokenomics</h3>
        <ol>
          <li>1,000,000 Starting Liquidity Pool Locked for 24 Months</li>
          <li>Inflationary Supply based on submission of care events.</li>
          <li>Minting Breakdown for Each Event</li>
        </ol>
        <table className="tokenomics-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Dog Activity (1,000 Tokens)</th>
              <th>Health Checkup (2,000 Tokens)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Liquidity Pool (10%)</td>
              <td>100 tokens</td>
              <td>200 tokens</td>
            </tr>
            <tr>
              <td>Charity Fund (40%)</td>
              <td>400 tokens</td>
              <td>800 tokens</td>
            </tr>
            <tr>
              <td>Submitter Reward (25%)</td>
              <td>250 tokens</td>
              <td>500 tokens</td>
            </tr>
            <tr>
              <td>Decentralized Compute Fund (10%)</td>
              <td>100 tokens</td>
              <td>200 tokens</td>
            </tr>
            <tr>
              <td>Development Team (10%)</td>
              <td>100 tokens</td>
              <td>200 tokens</td>
            </tr>
            <tr>
              <td>Marketing and Partnerships (5%)</td>
              <td>50 tokens</td>
              <td>100 tokens</td>
            </tr>
            <tr>
              <td colSpan={1}>Total Minted</td>
              <td>1,000 tokens</td>
              <td>2,000 tokens</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="content-section">
        <h3>🔰 Introducing StarPaws Governance Token</h3>
        <p>
          Alongside AstroBones, we are introducing StarPaws, a governance
          token designed to empower the community to shape the future of the
          Bulldog Galactic Federation.
        </p>
        <p><strong>How StarPaws Works</strong></p>
        <ul>
          <li>
            Earn StarPaws: Distributed in parallel with AstroBones for
            submitting care activities. Additionally participation in
            governance will be rewarded.
          </li>
          <li>
            Governance Features:
            <ul>
              <li>Submit Proposals</li>
              <li>Vote</li>
            </ul>
          </li>
        </ul>
      </section>

      <section className="content-section">
        <h4>Why StarPaws Matters</h4>
        <p>
          <em>Decentralized Decision-Making*</em>: StarPaws gives power
          to the community, making the Federation’s direction a
          collaborative effort.*
        </p>
        <p>
          <em>Support Innovation*</em>: Propose and vote for upgrades,
          new features, or partnerships that benefit dogs and their
          owners.
        </p>
      </section>

      <section className="content-section">
        <h3>📦 Liquidity Fund Distribution After 24 Months</h3>
        <p>
          60% of the Liquidity Fund will go to charities supporting animal
          welfare. 40% will be allocated to decentralized compute to
          upgrade Bulldroid and expand the Galactic Federation.
        </p>
      </section>

      <section className="content-section">
        <h3>🔄 Join the Bulldog Galactic Federation</h3>
        <p>
          Be part of an interstellar community dedicated to the health,
          happiness, and prosperity of dogs everywhere. Together, we'll
          make the galaxy a better place—one bulldog at a time!
        </p>
        <div className="bulldroid-image-container">
          <div className="portal-background"></div>
          <div className="portal-glow"></div>
          <img 
            src="/images/bulldroid.png"
            alt="Bulldroid AI Assistant" 
            className="bulldroid-image"
          />
        </div>
        <p>{`{Chat window allowing you to interact with Bulldroid}`}</p>
      </section>

      <section className="faq-section">
        <h3>Bulldroid FAQ</h3>
        <h4>General Questions</h4>
        <p><strong>Q1: What is Bulldroid?</strong></p>
        <p>
          Bulldroid is an AI automated trading bot that specializes in
          bulldog care. It helps track pet care activities, rewards owners
          with AstroBones tokens, and autonomously trades cryptocurrency
          based on real time information to grow wealth for the Bulldog
          Galactic Federation.
        </p>

        <details>
          <summary>Q2: How can Bulldroid help me care for my dog?</summary>
          <p>
            Bulldroid tracks and records your dog's health activities, including feeding, exercise, grooming, and vet visits. It provides expert care insights tailored for bulldogs and rewards your efforts with AstroBones tokens.
          </p>
        </details>

        <details>
          <summary>Q3: What are AstroBones tokens?</summary>
          <p>
            AstroBones tokens are Bulldroid's rewards system. You earn tokens for logging care activities for your dog. These tokens can be used within the ecosystem or traded for other purposes.
          </p>
        </details>

        <details>
          <summary>Q4: How do I join the Bulldog Galactic Federation?</summary>
          <p>
            Simply start using Bulldroid! Log care events for your bulldog, contribute to bulldroids trading fund, and participate in governance with StarPaws tokens.
            Also don't forget to join the Bulldog Galactic Federation on Discord!
          </p>
        </details>

        <h4>AstroBones Tokenomics</h4>

        <details>
          <summary>Q5: How does token minting work?</summary>
          <p>
            AstroBones are minted based on logged care events:
          </p>
          <ul>
            <li>Dog Activity: 1,000 tokens</li>
            <li>Health Checkup: 2,000 tokens</li>
          </ul>
          <p>Minting is distributed as follows:</p>
          <ul>
            <li>10% Liquidity Pool</li>
            <li>40% Charity Fund</li>
            <li>25% Submitter Reward</li>
            <li>10% Decentralized Compute Fund</li>
            <li>10% Development Team</li>
            <li>5% Marketing and Partnerships</li>
          </ul>
        </details>

        <details>
          <summary>Q6: Is there a cap on AstroBones tokens?</summary>
          <p>
            AstroBones have an inflationary supply, as tokens are minted in response to logged care activities.
          </p>
        </details>

        <details>
          <summary>Q7: What happens to the Liquidity Fund after 24 months?</summary>
          <p>After 24 months, the Liquidity Fund is distributed:</p>
          <ul>
            <li>60% to animal welfare charities.</li>
            <li>40% for decentralized compute to enhance Bulldroid.</li>
          </ul>
        </details>

        <h4>StarPaws Governance Token</h4>

        <details>
          <summary>Q8: What is the purpose of StarPaws tokens?</summary>
          <p>
            StarPaws tokens enable decentralized governance within the Bulldog Galactic Federation. Community members can submit proposals, vote, and shape the network's future.
          </p>
        </details>

        <details>
          <summary>Q9: How do I earn StarPaws tokens?</summary>
          <p>
            StarPaws tokens are distributed alongside AstroBones for care event submissions and as rewards for participating in governance activities.
          </p>
        </details>

        <details>
          <summary>Q10: What can I do with StarPaws tokens?</summary>
          <ul>
            <li>Submit Proposals: Suggest changes or initiatives for the Federation.</li>
            <li>Vote: Use your tokens to vote on proposals and steer the community's direction.</li>
          </ul>
        </details>

        <h4>Crypto Trading and Wealth Building</h4>

        <details>
          <summary>Q11: How does Bulldroid trade cryptocurrency?</summary>
          <p>
            You can deposit cryptocurrency into Bulldroid, which autonomously trades on behalf of the Federation. The profits support initiatives benefiting bulldogs and the Galactic Federation. Bulldroid will also payout 50% of the profits to investors.
          </p>
        </details>

        <details>
          <summary>Q12: Is my cryptocurrency secure?</summary>
          <p>
            Yes, Bulldroid prioritizes security for all deposits and trades to ensure the safety of user funds.
          </p>
        </details>

        <h4>Charity and Community Impact</h4>

        <details>
          <summary>Q13: How does Bulldroid support animal welfare?</summary>
          <p>
            A significant portion (40%) of every minted AstroBones token is allocated to a charity fund. After 24 months, 60% of the Liquidity Fund is distributed to animal welfare organizations.
          </p>
        </details>

        <details>
          <summary>Q14: Can I participate in deciding which charities receive funding?</summary>
          <p>
            Yes! Use your StarPaws tokens to vote on proposals, including charity initiatives.
          </p>
        </details>

        <h4>Getting Started</h4>

        <details>
          <summary>Q15: How do I start earning AstroBones tokens?</summary>
          <p>
            Log your dog's care activities (feeding, exercise, grooming, and vet visits) through Bulldroid. Tokens are minted and rewarded for each event you submit.
          </p>
        </details>

        <details>
          <summary>Q16: Can I participate if I don't own a bulldog?</summary>
          <p>
            While Bulldroid focuses on bulldog care, the platform encourages all dog lovers to join and benefit from its insights, rewards, and community.
          </p>
        </details>

        <h4>Technical and Support</h4>

        <details>
          <summary>Q17: How can I contact support for technical issues?</summary>
          <p>
            Visit the Bulldroid website or reach out through the in-app support feature for assistance.
          </p>
        </details>

        <details>
          <summary>Q18: Can I connect Bulldroid with other pet care apps or devices?</summary>
          <p>
            Integration options are under development. Stay tuned for updates through the Bulldroid community.
          </p>
        </details>

        <h4>Join the Mission</h4>

        <details>
          <summary>Q19: Why should I join the Bulldog Galactic Federation?</summary>
          <p>
            By joining, you become part of a community that values dog care, innovation, and collaboration. Help make the galaxy a better place—one bulldog at a time!
          </p>
        </details>

        <details>
          <summary>Q20: Where can I learn more?</summary>
          <p>
            Join Bulldroid and the Bulldog Galactic Federation on Discord!
          </p>
        </details>
      </section>
    </div>
  );
};

export default BulldroidLanding; 