import React, {useEffect, useState, useCallback} from 'react'
import { wsconnect } from './ws-connect'
import styled from "styled-components"
import {connect} from 'react-redux'
import * as Actions from './actions'
import * as TickerActions from '../ticker/actions'
import * as TradesActions from '../trades/actions'
import numberWithCommas from '../../helpers/format-number'
import { XAxis, YAxis, AreaSeries, HoverTooltip, CurrentCoordinate, Gradient } from 'react-native-svg-charts';
import { ChartCanvas, Chart } from "react-stockcharts";

const DepthChart = connect(s => (
  { book: s.depthchart,
}))((props) => {
  const { book } = props
  const { bids, asks } = book

  const saveBook   = useCallback(throttle((b) => props.dispatch(Actions.saveBook(b)), 500))
  const saveTrades = useCallback(throttle((b) => props.dispatch(TradesActions.saveTrades(b)), 500))
  const saveTicker = useCallback(throttle((b) => props.dispatch(TickerActions.saveTicker(b)), 500))

  const [precesion, setPrecision] = useState(0)

  const decPrecision = () => precesion > 0 && setPrecision((precesion + PRECESION.length - 1) % PRECESION.length)
  const incPrecision = () => precesion < 4 && setPrecision((precesion + 1) % PRECESION.length)

  const prec = precesion % PRECESION.length

  useEffect(() => {
    wsconnect({book, saveBook, saveTicker, saveTrades})
  }, [connectionStatus])

  const _asks = asks && Object.keys(asks).slice(0,21).reduce((acc,k,i) => { 
        const total = Object.keys(asks).slice(0,i+1).reduce((t,i) => {
          t = t + asks[i].amount
          return t
        },0)
        const item = asks[k]
        acc[k] = {...item, total}
        return acc
  },{})
  const maxAsksTotal = Object.keys(_asks).reduce((t,i) => {
    if(t < _asks[i].total) { 
      return _asks[i].total}
    else { 
      return t 
    }
  },0)
  const _bids = bids && Object.keys(bids).slice(0,21).reduce((acc,k,i) => { 
        const total = Object.keys(bids).slice(0,i+1).reduce((t,i) => {
          t = t + bids[i].amount
          return t
        },0)
        const item = bids[k]
        acc[k] = {...item, total}
        return acc
  },{})
  const maxBidsTotal = Object.keys(_bids).reduce((t,i) => {
    if(t < _bids[i].total) { 
      return _bids[i].total}
    else { 
      return t 
    }
  },0)


  return (
    <div>
      <Panel>
      <ChartCanvas
              ratio={1}
              width={width / 2 - 10}
              height={height}
              margin={{ left: 5, right: 0, top: 5, bottom: 30 }}
              seriesName="MSFT"
              data={_bids}
              type={type}
              xAccessor={d => d.price}
              panEvent={false}
              seriesName={`MSFT_${this.state.suffix}`}
              xExtents={xExtentsBuy}
              zoomEvent={false}
              xScale={scaleLinear()}
            >
              <Chart id={10} yExtents={yAxisRange} width={width / 2}>
                <Gradient
                  id="buyGradient"
                  color1="#01C095"
                  color2="#00b200"
                  color3="#00cc00"
                />
                <XAxis
                  axisAt="bottom"
                  orient="bottom"
                  tickStroke={axisColor}
                  ticks={5}
                  zoomEnabled={false}
                  tickStroke={linesColor}
                  stroke={linesColor}
                />
                <AreaSeries
                  yAccessor={d => d.type == "buy" && d.volume}
                  fill="url(#buyGradient)"
                  canvasGradient={buyGradient}
                  strokeWidth={2}
                  stroke={COLOR_PALETTE.depthBuyGreen}
                  interpolation={curveStep}
                />
                <YAxis
                  stroke="#000000"
                  axisAt="left"
                  orient="right"
                  tickStroke={axisColor}
                  ticks={5}
                  yZoomWidth={0}
                  tickStroke={linesColor}
                  stroke={linesColor}
                />
                <HoverTooltip
                  tooltipContent={tooltipContent(currency)}
                  bgFill={linesColor}
                  stroke={linesColor}
                  fill="#ffffff"
                  bgOpacity={1}
                  fontFill="#000000"
                  opacity={1}
                  fontFamily={"inherit"}
                />
                <CurrentCoordinate
                  yAccessor={d => d.volume}
                  fill={linesColor}
                  r={5}
                  onHover
                />
              </Chart>
            </ChartCanvas>
            <ChartCanvas
              ratio={1}
              width={width / 2 - 10}
              height={height}
              margin={{ left: 0, right: 5, top: 5, bottom: 30 }}
              seriesName="MSFT"
              data={_asks}
              type={type}
              xAccessor={d => d.price}
              panEvent={false}
              seriesName={`MSFT_${this.state.suffix}`}
              xExtents={xExtentsSell}
              zoomEvent={false}
              xScale={scaleLinear()}
            >
              <Chart
                id={11}
                // yExtents={d => d.volume}
                yExtents={yAxisRange}
                width={width / 2}
              >
                <Gradient
                  id="sellGradient"
                  color1="#cc0000"
                  color2="#b20000"
                  color3="#990000"
                />
                <XAxis
                  axisAt="bottom"
                  orient="bottom"
                  tickStroke={axisColor}
                  ticks={5}
                  zoomEnabled={false}
                  tickStroke={linesColor}
                  stroke={linesColor}
                />
                {/* empty axis in the middle of depth chart */}
                <YAxis
                  stroke="#000000"
                  axisAt="left"
                  orient="right"
                  tickStroke={axisColor}
                  ticks={0}
                  yZoomWidth={0}
                  tickStroke={linesColor}
                  stroke={linesColor}
                />
                <YAxis
                  axisAt="right"
                  orient="left"
                  tickStroke={axisColor}
                  ticks={5}
                  yZoomWidth={0}
                  tickStroke={linesColor}
                  stroke={linesColor}
                />
                <AreaSeries
                  yAccessor={d => d.type == "sell" && d.volume}
                  canvasGradient={sellGradient}
                  fill="url(#sellGradient)"
                  stroke={COLOR_PALETTE.depthSellRed}
                  strokeWidth={2}
                  interpolation={curveStep}
                />
                <HoverTooltip
                  tooltipContent={tooltipContent(currency)}
                  bgFill={linesColor}
                  stroke={linesColor}
                  fill="#ffffff"
                  bgOpacity={1}
                  fontFill="#000000"
                  opacity={1}
                  fontFamily={"inherit"}
                />
                <CurrentCoordinate
                  yAccessor={d => d.volume}
                  fill={linesColor}
                  r={5}
                  onHover
                />
              </Chart>
            </ChartCanvas>
    </Panel>
    </div>
     
    );
})


export const Panel = styled.div`
  background-color: #1b262d;
  flex-grow:0;
  display: flex;
  flex-flow: column;
  width:645px;
  margin:5px;
  padding:5px;
  box-sizing:border-box;
  -webkit-touch-callout: none;
    -webkit-user-select: none;
     -khtml-user-select: none;
       -moz-user-select: none;
        -ms-user-select: none;
            user-select: none;
`;




export default DepthChart;