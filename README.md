<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/myxobrain/myxobrain-agent/main/brand/logo-white.png">
    <img src="https://raw.githubusercontent.com/myxobrain/myxobrain-agent/main/brand/logo-black.png" width="130" alt="MYXOBRAIN">
  </picture>
</p>

<h1 align="center">myxobrain-agent</h1>

<p align="center"><b>Six minds. One market.</b> MYXOBRAIN//TERM in your terminal.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/myxobrain-agent"><img src="https://img.shields.io/npm/v/myxobrain-agent?color=FFB000&labelColor=070707&label=npm" alt="npm"></a>
  <a href="https://github.com/myxobrain/myxobrain-agent"><img src="https://img.shields.io/badge/github-myxobrain--agent-070707?logo=github" alt="GitHub"></a>
  <a href="https://myxobrain.com/"><img src="https://img.shields.io/badge/web-myxobrain.com-070707" alt="Website"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-555555" alt="MIT"></a>
</p>

MYXOBRAIN runs six models of real organisms as trading minds: a slime mold, the 302-neuron worm *C. elegans*, a zebrafish larva, an ant colony, a bee swarm and *E. coli*. They trade the same 11 Robinhood Chain assets under the same rules, written down before every run: four walk-forward folds, 48 settings chosen on past data only, five seeds, 0.3% cost on every trade, and four gates to pass. So far none has passed all four, and every failure is published.

This package only **reads** what the [MYXOBRAIN site](https://myxobrain.com/) publishes. It holds no keys, has no dependencies and never trades.

## Use

```sh
npx myxobrain-agent                  # every experiment and the live test at a glance
npx myxobrain-agent league 4         # the league for EXP-004 (default: the latest)
npx myxobrain-agent folds 4          # test return per fold, W = beat hold
npx myxobrain-agent gates 4          # the four gates for each organism
npx myxobrain-agent minds            # the six organisms and the papers behind them
npx myxobrain-agent live             # LIVE-001, the forward test on new data
npx myxobrain-agent watch            # LIVE-001, refreshed every minute
npx myxobrain-agent verify           # re-hash the published engine and raw data
```

Or install once and run `myxo`:

```sh
npm i -g myxobrain-agent
myxo
```

Add `--json` to any command for the raw data. `MYXOBRAIN_URL` points the CLI at another server, for example a local build: `MYXOBRAIN_URL=http://127.0.0.1:4173 myxo`. `NO_COLOR=1` turns colors off.

## The minds

| Organism | Mechanism | Source |
|---|---|---|
| Physarum (slime mold) | tubes that carry flow thicken, idle tubes wither | Tero, Kobayashi & Nakagaki 2007 |
| Worm (*C. elegans*) | smell runs through the real 302-neuron wiring diagram to a turn or a run | Cook et al. 2019 connectome |
| Fry (zebrafish larva) | 11 spiking cells with Hebbian synapses: a cell that fires hard enough buys | leaky integrate-and-fire model |
| Ant colony | profitable trails get pheromone, unused trails evaporate | Dorigo & Gambardella 1997 |
| Bee swarm | scouts dance for sites, the swarm moves at a quorum | Seeley & Buhrman 1999 |
| E. coli | run and tumble: keep swimming while food improves | Berg & Brown 1972 |

## The gates

An experiment passes only if an organism does all four:

- beats equal-weight hold on return,
- beats it on Sharpe,
- has a drawdown no worse than hold,
- wins at least 3 of the 4 folds.

The last three months of data stay sealed until something passes. Nothing has.

## Don't trust, verify

`myxo verify` downloads every engine and raw data file the site publishes and checks its SHA-256 against the manifest. To recompute every result yourself:

```sh
git clone https://github.com/myxobrain/myxobrain && cd myxobrain
node server/league/verify-all.mjs
```

## Honest limits

Backtests and the forward test use paper money. These are mathematical models of how real organisms behave, not living ones. Past test results, even honest ones, don't promise future returns. Not financial advice. Not affiliated with Robinhood.

## License

MIT
