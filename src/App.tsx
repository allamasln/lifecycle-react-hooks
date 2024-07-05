import React from 'react'

const RenderCountContext = React.createContext(() => {})

function RenderCountProvider(props: { children: React.ReactNode }) {
	const countRef = React.useRef<HTMLElement>(null)

	console.groupCollapsed('Render #1')

	const incrementRenderCount = () => {
		countRef.current!.textContent = (
			parseInt(countRef.current!.textContent!, 10) + 1
		).toString()

		console.groupEnd()
		console.groupCollapsed('Render #' + countRef.current!.textContent)
	}

	return (
		<RenderCountContext.Provider value={incrementRenderCount}>
			{props.children}
			<p>
				Render count:<span ref={countRef}>1</span>
			</p>
		</RenderCountContext.Provider>
	)
}

function App() {
	return (
		<RenderCountProvider>
			<Parent />
		</RenderCountProvider>
	)
}

function Parent() {
	useHookFLowLogger('Parent')

	const [isChildrenVisible, toggleChildren] = useToggle()

	const handleCheck = () => toggleChildren((prev) => !prev)

	return (
		<div>
			<input
				type="checkbox"
				checked={isChildrenVisible}
				onChange={handleCheck}
			/>
			{isChildrenVisible && (
				<>
					<Child instance={1} />
					<Child instance={2} />
				</>
			)}
		</div>
	)
}

function Child({ instance }: { instance: number }) {
	useHookFLowLogger('Child', instance)

	const [, update] = useToggle()
	const buttonRef = React.useRef<HTMLButtonElement>(null)

	const handleClick = () => {
		buttonRef.current!.style.backgroundColor = getRandomLightColor()
		update()
	}

	return (
		<button ref={buttonRef} onClick={handleClick}>
			Update Child
		</button>
	)
}

function useHookFLowLogger(componentName: string, instance?: number) {
	const componentLabel = instance
		? `${componentName} #${instance}`
		: componentName

	console.log(`[${componentLabel}] started rendering`)

	React.useState(() =>
		console.log(`[${componentLabel}] lazy initialized`)
	)

	React.useEffect(() => {
		console.log(`[${componentLabel}] run effects (mounted)`)
		return () => {
			console.log(
				`[${componentLabel}] run cleanup effects (unmounted)`
			)
		}
	}, [componentLabel])

	React.useEffect(() => {
		console.log(`[${componentLabel}] run effects (updated)`)
	})

	console.log(`[${componentLabel}] finished rendering`)
}

function useToggle(
	defaultValue: boolean = false
): [boolean, (callback?: (prev: boolean) => boolean) => void] {
	const [state, setState] = React.useState(defaultValue)

	const incrementRenderCount = React.useContext(RenderCountContext)

	const toggle = React.useCallback(
		(callback?: (prev: boolean) => boolean) => {
			setState((prevState) =>
				callback ? callback(prevState) : !prevState
			)

			incrementRenderCount()
		},
		[]
	)

	return [state, toggle]
}

function getRandomLightColor() {
	const getRandomLightValue = () =>
		Math.floor(Math.random() * 56) + 200

	return `rgb(
			${getRandomLightValue()},
			${getRandomLightValue()},
			${getRandomLightValue()}
	)`
}

export default App
