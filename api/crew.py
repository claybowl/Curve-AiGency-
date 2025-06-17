import json
import os
from crewai import Crew, Agent, Task, Process
from groq import Groq
from flask import Response

def handler(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            prompt = body.get('prompt')
            crew_config = body.get('crew_config', {})
            agent_configs = crew_config.get('agents', [])
            provider_configs = crew_config.get('providers', [])

            if not prompt or not agent_configs:
                return Response(json.dumps({'error': 'Prompt and agent configurations are required.'}), status=400, content_type='application/json')

            # --- Helper function to create LLM ---
            def get_llm_for_agent(agent_config):
                provider_id = agent_config.get('llmProvider')
                model_name = agent_config.get('model')
                
                provider_config = next((p for p in provider_configs if p.get('id') == provider_id), None)
                if not provider_config or not provider_config.get('enabled'):
                    # Fallback or error
                    raise ValueError(f"LLM provider '{provider_id}' is not configured or not enabled.")

                # Use Groq as an example, assuming it's configured via env vars
                if provider_id == 'groq':
                    api_key = os.environ.get('GROQ_API_KEY')
                    if not api_key:
                        raise ValueError("GROQ_API_KEY environment variable not set.")
                    return Groq(api_key=api_key, model_name=model_name)
                
                # Add other providers here (e.g., OpenAI)
                # if provider_id == 'openai':
                #     api_key = os.environ.get('OPENAI_API_KEY')
                #     ...
                #     return ...

                raise ValueError(f"Unsupported LLM provider: {provider_id}")

            # --- Dynamically create agents ---
            researcher_config = next((a for a in agent_configs if a.get('id') == 'researcher'), None)
            planner_config = next((a for a in agent_configs if a.get('id') == 'planner'), None)

            if not researcher_config or not planner_config:
                raise ValueError("Required 'researcher' or 'planner' agent configurations not found.")

            researcher_llm = get_llm_for_agent(researcher_config)
            planner_llm = get_llm_for_agent(planner_config)

            researcher = Agent(
                role=researcher_config.get('name', 'Research Analyst'),
                goal=researcher_config.get('systemPrompt', 'Analyze the topic and provide key insights.'),
                backstory=researcher_config.get('description', 'An expert in searching and synthesizing information.'),
                llm=researcher_llm,
                allow_delegation=False,
                verbose=True
            )

            planner = Agent(
                role=planner_config.get('name', 'Planning Specialist'),
                goal=planner_config.get('systemPrompt', 'Create a step-by-step plan based on the research.'),
                backstory=planner_config.get('description', 'A master of creating actionable plans.'),
                llm=planner_llm,
                allow_delegation=False,
                verbose=True
            )

            # --- Create tasks ---
            research_task = Task(
                description=f"Conduct a thorough analysis of the following topic: '{prompt}'. Identify key points, challenges, and opportunities.",
                expected_output="A comprehensive report with bullet points summarizing the findings.",
                agent=researcher
            )

            planning_task = Task(
                description="Based on the research report, create a detailed, step-by-step action plan.",
                expected_output="A clear and concise plan with actionable steps, timelines, and required resources.",
                agent=planner,
                context=[research_task]
            )

            # --- Create and run the crew ---
            crew = Crew(
                agents=[researcher, planner],
                tasks=[research_task, planning_task],
                process=Process.sequential,
                # Add callback for streaming
            )

            result = crew.kickoff()
            
            # This part needs to be adapted for streaming as in the previous step
            return Response(json.dumps({'result': result}), status=200, content_type='application/json')

        except Exception as e:
            return Response(json.dumps({'error': str(e)}), status=500, content_type='application/json')
    else:
        return Response(json.dumps({'error': 'Method not allowed'}), status=405, content_type='application/json')
