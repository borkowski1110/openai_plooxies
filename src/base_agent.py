from agents import Agent, Runner, tool

# --------------------------
# Step 1: Create Specialized Agents
# --------------------------

@tool.function_tool
def calculate_expression(expression: str) -> float:
    """Evaluate basic arithmetic expressions using Python's eval()"""
    try:
        return eval(expression)
    except:
        return "Error: Invalid expression"

math_agent = Agent(
    name="MathExpert",
    instructions="You solve math problems using the calculate_expression tool.",
    tools=[calculate_expression],
    model="gpt-4"
)

coding_agent = Agent(
    name="CodeAssistant",
    instructions="You generate Python code solutions. Always provide runnable code blocks.",
    model="gpt-4"
)

# --------------------------
# Step 2: Create Triage Agent
# --------------------------

triage_agent = Agent(
    name="TriageBot",
    instructions="""Analyze queries and decide which agent should handle them:
    1. Math problems -> MathExpert
    2. Coding questions -> CodeAssistant
    3. General questions -> Handle yourself
    
    Respond ONLY with one word: MathExpert, CodeAssistant, or Self""",
    model="gpt-4"
)

# --------------------------
# Step 3: Delegation System
# --------------------------

def handle_query(query: str) -> str:
    # First stage: Determine which agent should handle the query
    routing_decision = Runner.run_sync(triage_agent, query).final_output.strip()
    
    # Second stage: Route to appropriate agent
    if routing_decision == "MathExpert":
        print("Routing to Math Expert...")
        return Runner.run_sync(math_agent, query).final_output
    elif routing_decision == "CodeAssistant":
        print("Routing to Code Assistant...")
        return Runner.run_sync(coding_agent, query).final_output
    else:
        print("Handling general query...")
        return Runner.run_sync(triage_agent, query).final_output

# --------------------------
# Step 4: Test the System
# --------------------------

queries = [
    "What's 15% of 80? Show the calculation",
    "Write a Python function to calculate Fibonacci numbers",
    "Explain quantum computing in simple terms",
    "Solve: (3^2 + 4^2)^0.5"
]

for query in queries:
    print(f"\nQuery: {query}")
    print("Response:", handle_query(query))
    print("-" * 50)
