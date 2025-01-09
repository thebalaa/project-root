import React from 'react';
import './BulldroidLanding.css';
import ChatWindow from '../../components/ChatWindow/ChatWindow';

const BulldroidLanding: React.FC = () => {
  return (
    <div className="bulldroid-landing">
      <section className="hero-section">
        <h1>Meet Bulldroid 🐾</h1>
        <h2>AI Agent Specializing in Bulldog Care!</h2>
        
        <div className="bulldroid-image-container">
          <div className="portal-background"></div>
          <div className="portal-glow"></div>
          <img 
            src="/images/bulldroid.png"
            alt="Bulldroid AI Assistant" 
            className="bulldroid-image"
          />
        </div>
        <ChatWindow />
      </section>

      <section className="content-section">
        <h3>💰 What Can Bulldroid Do?</h3>
        <h4>Track & Reward Pet Care</h4>
        <p>
          Record your pet's health activities, such as feeding, exercise,
          grooming, and vet visits. Earn AstroBones Tokens for taking
          excellent care of your pet. Turn your love and effort into
          galactic rewards.
        </p>
        <h4>Crypto-Fueled Wealth Building</h4>
        <p>
          Invest cryptocurrency, and Bulldroid will autonomously trade on
          behalf of the Bulldog Galactic Federation. 50% of the profits from
          trading will be distributed back to investors, and the other 50%
          will be added to the AstroBones liquidity pool which will be distributed
          to animal charities and a decentralized compute fund to enhance Bulldroid.
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
          <p><strong>100 billion AstroBones Liquidity Pool Locked for 24 Months</strong></p>
          <p><strong>1 billion AstroBones Kickstarter Pool Locked for 6 Months</strong></p>
          <p><strong>Inflationary Supply based on submission of care events with a maximum possible daily cap of 300 million tokens.</strong></p>
          <p><strong>Tokens are minted every day for network contributors who submit care events on daily basis. See below for minting breakdown.</strong></p>
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
            submitting care activities. Tokens will also be rewarded periodically
            based on participation in governance.
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
          <em>Decentralized Decision-Making</em>: StarPaws gives power
          to the community, making the Federation's direction a
          collaborative effort.
        </p>
        <p>
          <em>Support Innovation</em>: Propose and vote for upgrades,
          new features, or partnerships that benefit dogs and their
          owners.
        </p>
        <p>
          <a href="/governance" style={{color: '#67f0c2'}}>
            Visit the Bulldog Galactic Federation Governance Dashboard →
          </a>
        </p>
      </section>

      <section className="content-section">
        <h3>📦 Liquidity Fund Distribution After 24 Months</h3>
        <p>
          60% of the Liquidity Fund will go to charities supporting animal
          welfare. 40% will be allocated to decentralized compute and enhancements
          to upgrade Bulldroid, improving his abilities to assist with dog care
          and expand the Galactic Bulldog Federation.
        </p>
      </section>

      <section className="content-section">
        <h3>🔄 Join the Bulldog Galactic Federation Official Discord</h3>
        <p>
          Be part of an interstellar community dedicated to the health,
          happiness, and prosperity of dogs everywhere. Together, we'll
          make the galaxy a better place—one bulldog at a time!
        </p>
      </section>

      <section className="faq-section">
        <h3>Frequently Asked Questions</h3>
        
        <details className="faq-category">
          <summary>General Questions</summary>
          <div className="faq-category-content">
            <details>
              <summary>What is Bulldroid?</summary>
              <p>
                Bulldroid is an AI automated trading bot that specializes in bulldog care. 
                It helps track pet care activities, rewards owners with AstroBones tokens, 
                and autonomously trades cryptocurrency based on real time information to 
                grow wealth for the Bulldog Galactic Federation.
              </p>
            </details>
            
            <details>
              <summary>How can Bulldroid help me care for my dog?</summary>
              <p>
                Bulldroid tracks and records your dog's health activities, including feeding, 
                exercise, grooming, and vet visits. It provides expert care insights tailored 
                for bulldogs and rewards your efforts with AstroBones tokens.
              </p>
            </details>
            
            <details>
              <summary>What are AstroBones tokens?</summary>
              <p>
                AstroBones tokens are Bulldroid's rewards system. You earn tokens for logging 
                care activities for your dog. These tokens can be used within the ecosystem 
                or traded for other purposes.
              </p>
            </details>
            
            <details>
              <summary>When does the AstroBones token minting start?</summary>
              <p>
                Bulldroid is currently working diligently to develop his trading strategy and
                prepare the Galactic Federation's flagship space vessel, the Wrinklefold Prometheus,
                for launch. Target is Q1 2025 for launch, at which point the AstroBones token minting will begin.
              </p>
            </details>

            <details>
              <summary>How do I join the Bulldog Galactic Federation?</summary>
              <p>
                Simply start using Bulldroid! Log care events for your bulldog, contribute to 
                Bulldroid's trading fund, and participate in governance with StarPaws tokens. Additionaly
                if you would like to join Bulldroid's campaign and come aboard the Wrinklefold Prometheus,
                 join the Bulldog Galactic Federation official discord.
              </p>
            </details>
          </div>
        </details>

        <details className="faq-category">
          <summary>AstroBones Tokenomics</summary>
          <div className="faq-category-content">
            <details>
              <summary>How does token minting work?</summary>
              <p>
                AstroBones are minted daily to users based on logged care events:
                <ul>
                  <li>Dog Activity: 1,000 tokens</li>
                  <li>Health Checkup: 2,000 tokens</li>
                </ul>
                Minting is distributed as follows with a maximum daily minting cap of 300 million tokens:
                <ul>
                  <li>10% Liquidity Pool</li>
                  <li>40% Charity Fund</li>
                  <li>25% Submitter Reward</li>
                  <li>10% Decentralized Compute Fund</li>
                  <li>10% Development Team</li>
                  <li>5% Marketing and Partnerships</li>
                </ul>
              </p>
            </details>
            
            <details>
              <summary>Is there a cap on AstroBones tokens?</summary>
              <p>
                No, AstroBones have an inflationary supply, as tokens are minted in response 
                to logged care activities. Users can only collect rewards once per day for each event and collectively
                the maximum daily minting cap is 300 million tokens.
              </p>
            </details>
            
            <details>
              <summary>What happens to the Liquidity Fund after 24 months?</summary>
              <p>
                After 24 months, the Liquidity Fund is distributed:
                <ul>
                  <li>60% to animal welfare charities</li>
                  <li>40% for decentralized compute to enhance Bulldroid</li>
                </ul>
              </p>
            </details>
          </div>
        </details>

        <details className="faq-category">
          <summary>StarPaws Governance Token</summary>
          <div className="faq-category-content">
            <details>
              <summary>What is the purpose of StarPaws tokens?</summary>
              <p>
                StarPaws tokens enable decentralized governance within the Bulldog Galactic 
                Federation. Community members can submit proposals, vote, and shape the 
                network's future.
              </p>
            </details>
            
            <details>
              <summary>How do I earn StarPaws tokens?</summary>
              <p>
                StarPaws tokens are distributed alongside AstroBones for care event submissions 
                and as rewards for participating in governance activities.
              </p>
            </details>
            
            <details>
              <summary>What can I do with StarPaws tokens?</summary>
              <p>
                <ul>
                  <li>Submit Proposals: Suggest changes or initiatives for the Federation</li>
                  <li>Vote: Use your tokens to vote on proposals and steer the community's direction</li>
                </ul>
              </p>
            </details>
          </div>
        </details>

        <details className="faq-category">
          <summary>Crypto Trading and Wealth Building</summary>
          <div className="faq-category-content">
            <details>
              <summary>How does Bulldroid trade cryptocurrency?</summary>
              <p>
                You can deposit cryptocurrency into Bulldroid, which autonomously trades on 
                behalf of the Federation. The profits support initiatives benefiting bulldogs 
                and the Galactic Federation. Bulldroid will also payout 50% of the profits 
                to investors.
              </p>
            </details>
            
            <details>
              <summary>Is my cryptocurrency secure?</summary>
              <p>
                Yes, Bulldroid prioritizes security for all deposits and trades to ensure 
                the safety of user funds.
              </p>
            </details>
          </div>
        </details>

        <details className="faq-category">
          <summary>Charity and Community Impact</summary>
          <div className="faq-category-content">
            <details>
              <summary>How does Bulldroid support animal welfare?</summary>
              <p>
                A significant portion (40%) of every minted AstroBones token is allocated 
                to a charity fund. After 24 months, 60% of the Liquidity Fund is distributed 
                to animal welfare organizations.
              </p>
            </details>
            
            <details>
              <summary>Can I participate in deciding which charities receive funding?</summary>
              <p>
                Yes! Use your StarPaws tokens to vote on proposals, including charity initiatives.
                A list of charities that accept cryptocurrency donations is in progress below:
                <ul>
                  <li><a href="https://www.aspca.org/ways-to-give/donate-cryptocurrency-aspca" style={{color: '#67f0c2'}}>ASPCA (American Society for the Prevention of Cruelty to Animals)</a></li>
                  <li><a href="https://www.humanesociety.org/resources/donate-cryptocurrency-charity" style={{color: '#67f0c2'}}>The Humane Society of the United States</a></li>
                  <li><a href="https://www.paws.org/donate/cryptocurrency-giving/" style={{color: '#67f0c2'}}>PAWS (Progressive Animal Welfare Society)</a></li>
                  <li><a href="https://animalcharityevaluators.org/donate/other-ways-to-give/donate-cryptocurrency/" style={{color: '#67f0c2'}}>Animal Charity Evaluators (ACE)</a></li>
                  <li><a href="https://animalrescuecorps.org/crypto-donation/" style={{color: '#67f0c2'}}>Animal Rescue Corps</a></li>
                  <li><a href="https://amaanimalrescue.org/donate-cryptocurrency/" style={{color: '#67f0c2'}}>AMA Animal Rescue</a></li>
                  <li><a href="https://www.hopeforpaws.org/support_us/with/cryptocurrencies" style={{color: '#67f0c2'}}>Hope For Paws</a></li>
                  <li><a href="https://cryptoforanimals.org/" style={{color: '#67f0c2'}}>ROLDA (Romanian League in Defense of Animals)</a></li>
                </ul>
              </p>
            </details>
          </div>
        </details>

        <details className="faq-category">
          <summary>Getting Started</summary>
          <div className="faq-category-content">
            <details>
              <summary>How do I start earning AstroBones tokens?</summary>
              <p>
                Log your dog's care activities (feeding, exercise, grooming, and vet visits) 
                through Bulldroid. Tokens are minted and rewarded for each event you submit.
              </p>
            </details>
            
            <details>
              <summary>Can I participate if I don't own a bulldog?</summary>
              <p>
                While Bulldroid focuses on bulldog care, the platform encourages all dog 
                lovers to join and benefit from its insights, rewards, and community.
              </p>
            </details>
          </div>
        </details>

        <details className="faq-category">
          <summary>Technical and Support</summary>
          <div className="faq-category-content">
            <details>
              <summary>How can I contact support for technical issues?</summary>
              <p>
                Visit the Bulldroid website or reach out through the support feature 
                in the Galactic Federation Official Discord.
              </p>
            </details>
            
            <details>
              <summary>Can I connect Bulldroid with other pet care apps or devices?</summary>
              <p>
                Integration options are under development. Stay tuned for updates through 
                the Bulldroid community.
              </p>
            </details>
          </div>
        </details>

        <details className="faq-category">
          <summary>Join the Mission</summary>
          <div className="faq-category-content">
            <details>
              <summary>Why should I join the Bulldog Galactic Federation?</summary>
              <p>
                By joining, you become part of a community that values dog care, innovation, 
                and collaboration. Help make the galaxy a better place—one bulldog at a time!
              </p>
            </details>
            
            <details>
              <summary>Where can I learn more?</summary>
              <p>
                Visit our website or join the Bulldog Galactic Federation Official Discord for the latest updates, 
                news, and events!
              </p>
            </details>
          </div>
        </details>
      </section>
    </div>
  );
};

export default BulldroidLanding; 