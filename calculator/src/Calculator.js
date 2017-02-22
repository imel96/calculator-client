import React, { Component } from 'react'
import PointTarget from 'react-point'

class Display extends Component {

	render() {
		const { value } = this.props
		return (
			<div className="calculator-display">
				{value}
			</div>
		)
	}
}

class History extends Component {

	render() {
		const { history } = this.props
		return (
			<table>
			<thead>
			<tr>
			<th>expr</th>
			</tr>
			</thead>
			<tbody>
			{history}
			</tbody>
			</table>
		)
	}
}

class KeypadKey extends Component {

	render() {
		const { onPress, className, ...props } = this.props

		return (
			<PointTarget onPoint={onPress}>
			<button className={`keypad-key ${className}`} {...props}/>
			</PointTarget>
		)
	}
}

class Calculator extends Component {

	state = {
		first: null,
		operator: null,
		onDisplay: '0',
		displaySaved: false,
		history: []
	}

	clearDisplay() {
		this.setState({
			onDisplay: '0'
		})
	}

	backspace() {
		const { onDisplay } = this.state

		this.setState({
			onDisplay: onDisplay.substring(0, onDisplay.length - 1) || '0'
		})
	}

	operator(op) {
		const { first, onDisplay, operator, history } = this.state

		if (first == null && operator == null) {
			// got 1st operand
			this.setState({
				first: onDisplay,
				operator: op,
				displaySaved: true
			})
		} else {
			// got 2nd operand
			let expr = first + "," + operator + "," + onDisplay
			let request = new Request('http://localhost:8080/expressions', {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: 'POST',
				body: JSON.stringify({
					expression: expr
				})
			})
			console.log(request)
			let self = this
			fetch(request).then(
				function(response) {
					fetch(response.headers.map.location).then(function(response) {
						response.json().then(function(result) {
						self.setState({
							first: null,
							onDisplay: result.result,
							operator: null,
							history: history.concat(expr),
							displaySaved: true
						})
					})
				})
			})
		}
		console.log(this.state)
	}

	number(digit) {
		const { onDisplay, displaySaved } = this.state

		if (displaySaved) {
			this.setState({
				onDisplay: String(digit),
				displaySaved: false
			})

		} else {
			this.setState({
				onDisplay: onDisplay === '0' ? String(digit) : onDisplay + digit
			})
		}
	}

	handleKeyDown = (event) => {
		console.log("handleKeyDown " + event.keyIdentifier)
		event.preventDefault()

		switch (event.keyIdentifier) {
		case 'U+0008':
			this.backspace()
			break
		case 'U+001B':
			this.clearDisplay()
			break
		case 'U+002B':
			this.operator('+')
			break
		case 'U+002D':
			this.operator('-')
			break
		case 'U+002A':
			this.operator('*')
			break
		case 'U+002F':
			this.operator('/')
			break
		case 'U+003D':
		case 'Enter':
			this.operator('=')
			break
		default:
			let digit = event.keyCode - 48

			if (digit >=0 && digit < 10) {
				this.number(digit)
			}
		}
	}

	componentDidMount() {
		document.body.addEventListener('keydown', this.handleKeyDown)
	}

	componentWillUnmount() {
		document.body.removeEventListener('keydown', this.handleKeyDown)
	}

	render() {
		const { onDisplay, history } = this.state
		return (
			<div className="calculator">
			<Display value={onDisplay} />
			<div className="keypad">
			<div className="operator-keys">
			      <KeypadKey className="key-add" onPress={() => this.operator('+')}>+</KeypadKey>
			      <KeypadKey className="key-min" onPress={() => this.operator('-')}>-</KeypadKey>
			      <KeypadKey className="key-mul" onPress={() => this.operator('*')}>*</KeypadKey>
			      <KeypadKey className="key-div" onPress={() => this.operator('/')}>/</KeypadKey>
			</div>
			<div className="number-keys">
			      <KeypadKey className="key-0" onPress={() => this.number(0)}>0</KeypadKey>
			      <KeypadKey className="key-1" onPress={() => this.number(1)}>1</KeypadKey>
			      <KeypadKey className="key-2" onPress={() => this.number(2)}>2</KeypadKey>
			      <KeypadKey className="key-3" onPress={() => this.number(3)}>3</KeypadKey>
			      <KeypadKey className="key-4" onPress={() => this.number(4)}>4</KeypadKey>
			      <KeypadKey className="key-5" onPress={() => this.number(5)}>5</KeypadKey>
			      <KeypadKey className="key-6" onPress={() => this.number(6)}>6</KeypadKey>
			      <KeypadKey className="key-7" onPress={() => this.number(7)}>7</KeypadKey>
			      <KeypadKey className="key-8" onPress={() => this.number(8)}>8</KeypadKey>
			      <KeypadKey className="key-9" onPress={() => this.number(9)}>9</KeypadKey>
			</div>
			<History value={history} />
			</div>
			</div>
		)
	}
}

export default Calculator
