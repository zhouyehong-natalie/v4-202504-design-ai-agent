import { useState } from "react";
import { db, collection, addDoc, updateDoc, doc } from "./firebase";

function App() {
  // State management
  const [activeGroup, setActiveGroup] = useState("A");
  
  // Group A states
  const [designerGoalA, setDesignerGoalA] = useState("");
  const [userProfilesA, setUserProfilesA] = useState([
    { dimension: "User ID", content: "" },
    { dimension: "Age", content: "" },
    { dimension: "Gender", content: "" },
    { dimension: "TAM Group", content: "" },
    { dimension: "Commuting Situation", content: "" }
  ]);
  const [customPromptA, setCustomPromptA] = useState("");
  const [apiKeyA, setApiKeyA] = useState("");
  const [designGuideA, setDesignGuideA] = useState("");
  const [designerNotes, setDesignerNotes] = useState("");
  const [loadingA, setLoadingA] = useState(false);
  const [currentDocIdA, setCurrentDocIdA] = useState(null);
  const [savingNotes, setSavingNotes] = useState(false);
  
  // GPT-4o parameters for Group A
  const [temperatureA, setTemperatureA] = useState(0.7);
  const [maxTokensA, setMaxTokensA] = useState(10000);
  const [topPA, setTopPA] = useState(1.0);

  // Group B states
  const [designerGoalB, setDesignerGoalB] = useState("");
  const [userProfilesB, setUserProfilesB] = useState([
    { dimension: "User ID", content: "" },
    { dimension: "Age", content: "" },
    { dimension: "Gender", content: "" },
    { dimension: "TAM Group", content: "" },
    { dimension: "Commuting Situation", content: "" }
  ]);
  const [customPromptB, setCustomPromptB] = useState("");
  const [apiKeyB, setApiKeyB] = useState("");
  const [designGuideB, setDesignGuideB] = useState("");
  const [userFeedback, setUserFeedback] = useState("");
  const [suggestedDimensions, setSuggestedDimensions] = useState("");
  const [loadingB, setLoadingB] = useState(false);
  const [currentDocIdB, setCurrentDocIdB] = useState(null);
  
  // GPT-4o parameters for Group B
  const [temperatureB, setTemperatureB] = useState(0.7);
  const [maxTokensB, setMaxTokensB] = useState(10000);
  const [topPB, setTopPB] = useState(1.0);
  
  // Group C states (Silicon Sample) - Added model selection functionality
  const [userIdC, setUserIdC] = useState("");
  const [userProfileC, setUserProfileC] = useState("");
  const [designerGoalC, setDesignerGoalC] = useState("");
  const [customPromptC, setCustomPromptC] = useState("");
  
  // New: Model selection and API keys
  const [selectedModelC, setSelectedModelC] = useState("gpt-4o"); // Default: GPT-4o
  const [apiKeyC, setApiKeyC] = useState(""); // OpenAI API key
  const [claudeApiKeyC, setClaudeApiKeyC] = useState(""); // Claude API key
  const [deepseekApiKeyC, setDeepseekApiKeyC] = useState(""); // Deepseek API key
  
  const [designGuideC, setDesignGuideC] = useState("");
  const [userEvaluation, setUserEvaluation] = useState("");
  const [loadingC, setLoadingC] = useState(false);
  const [currentDocIdC, setCurrentDocIdC] = useState(null);
  const [savingEvaluation, setSavingEvaluation] = useState(false);
  
  // Model parameters
  const [temperatureC, setTemperatureC] = useState(0.7);
  const [maxTokensC, setMaxTokensC] = useState(10000);
  const [topPC, setTopPC] = useState(1.0);
  
  // Error message state
  const [apiErrorC, setApiErrorC] = useState("");

  // Common functions
  const addUserProfile = (group) => {
    const newDimension = { dimension: "", content: "" };
    if (group === "A") {
      setUserProfilesA([...userProfilesA, newDimension]);
    } else if (group === "B") {
      setUserProfilesB([...userProfilesB, newDimension]);
    }
  };

  const updateUserProfile = (group, index, field, value) => {
    if (group === "A") {
      const profiles = [...userProfilesA];
      profiles[index][field] = value;
      setUserProfilesA(profiles);
    } else if (group === "B") {
      const profiles = [...userProfilesB];
      profiles[index][field] = value;
      setUserProfilesB(profiles);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Save designer notes for Group A
  const saveDesignerNotes = async () => {
    if (!currentDocIdA || !designerNotes.trim()) return;
    
    setSavingNotes(true);
    
    try {
      const docRef = doc(db, "groupA", currentDocIdA);
      await updateDoc(docRef, {
        designerNotes: designerNotes
      });
      
      // Show visual feedback that save was successful
      setTimeout(() => {
        setSavingNotes(false);
      }, 1000);
    } catch (error) {
      console.error("Error saving notes:", error);
      setSavingNotes(false);
    }
  };
  
  // Save user evaluation for Group C
  const saveUserEvaluation = async () => {
    if (!currentDocIdC || !userEvaluation.trim()) return;
    
    setSavingEvaluation(true);
    
    try {
      const docRef = doc(db, "groupC", currentDocIdC);
      await updateDoc(docRef, {
        userEvaluation: userEvaluation,
        evaluationTimestamp: new Date()
      });
      
      // Show visual feedback that save was successful
      setTimeout(() => {
        setSavingEvaluation(false);
      }, 1000);
    } catch (error) {
      console.error("Error saving evaluation:", error);
      setSavingEvaluation(false);
    }
  };

  // Modified core function: Support for multiple model API calls
  const generateDesignGuide = async (group) => {
    let states;
    if (group === "A") {
      // Group A logic remains unchanged
      states = {
        apiKey: apiKeyA,
        designerGoal: designerGoalA,
        userProfiles: userProfilesA,
        customPrompt: customPromptA,
        setLoading: setLoadingA,
        setDesignGuide: setDesignGuideA,
        setCurrentDocId: setCurrentDocIdA,
        temperature: temperatureA,
        maxTokens: maxTokensA,
        topP: topPA
      };
    } else if (group === "B") {
      // Group B logic remains unchanged
      states = {
        apiKey: apiKeyB,
        designerGoal: designerGoalB,
        userProfiles: userProfilesB,
        customPrompt: customPromptB,
        setLoading: setLoadingB,
        setDesignGuide: setDesignGuideB,
        setCurrentDocId: setCurrentDocIdB,
        temperature: temperatureB,
        maxTokens: maxTokensB,
        topP: topPB
      };
    } else {
      // Group C uses new multi-model structure
      states = {
        selectedModel: selectedModelC,
        apiKey: apiKeyC,
        claudeApiKey: claudeApiKeyC,
        deepseekApiKey: deepseekApiKeyC,
        designerGoal: designerGoalC,
        userProfile: userProfileC,
        customPrompt: customPromptC,
        setLoading: setLoadingC,
        setDesignGuide: setDesignGuideC,
        setCurrentDocId: setCurrentDocIdC,
        setApiError: setApiErrorC,
        temperature: temperatureC,
        maxTokens: maxTokensC,
        topP: topPC,
        userId: userIdC
      };
    }

    // Validate required API keys exist
    if (group === "C") {
      // Check appropriate API key based on selected model
      if (
        (states.selectedModel.startsWith("gpt") && !states.apiKey) ||
        (states.selectedModel === "claude-3-7-sonnet" && !states.claudeApiKey) ||
        (states.selectedModel === "deepseek-R1" && !states.deepseekApiKey)
      ) {
        states.setApiError("Please provide the appropriate API key for the selected model");
        states.setDesignGuide("Error: Missing API key for the selected model");
        return;
      }
    } else {
      // Groups A and B still use only OpenAI API
      if (!states.apiKey) {
        states.setDesignGuide("Please provide OpenAI API Key");
        return;
      }
    }

    states.setLoading(true);
    if (group === "C") {
      states.setApiError(""); // Clear previous errors
    }
    
    try {
      let profileText;
      let fullPrompt;
      let response;
      
      if (group === "C") {
        // Build digital clone simulation prompt for Group C
        fullPrompt = `You are creating a design guide for a digital clone of user "${states.userId}". 
        
Designer Goal: ${states.designerGoal}

User Profile:
${states.userProfile}

Custom Prompt: ${states.customPrompt}

Based on this user profile, generate a comprehensive design guide that would be most suitable for this specific user.`;

        // Call different APIs based on selected model
        switch (states.selectedModel) {
          case "gpt-4o":
          case "gpt-o1":
            // OpenAI API call (GPT-4o or GPT-o1)
            console.log("API Request (OpenAI):", {
              model: states.selectedModel,
              temperature: states.temperature,
              max_tokens: states.maxTokens,
            });
            
            response = await fetch("https://api.openai.com/R1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${states.apiKey}`
              },
              body: JSON.stringify({
                model: states.selectedModel,
                messages: [{ role: "system", content: fullPrompt }],
                temperature: states.temperature,
                max_tokens: states.maxTokens,
                top_p: states.topP
              })
            });
            break;
            
          case "claude-3-7-sonnet":
            // Claude API call
            console.log("API Request (Claude):", {
              model: "claude-3-7-sonnet-20250219",
              temperature: states.temperature,
              max_tokens: states.maxTokens,
            });
            
            response = await fetch("https://api.anthropic.com/R1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": states.claudeApiKey,
                "anthropic-version": "2023-06-01"
              },
              body: JSON.stringify({
                model: "claude-3-7-sonnet-20250219",
                max_tokens: states.maxTokens,
                temperature: states.temperature,
                messages: [
                  { role: "user", content: fullPrompt }
                ]
              })
            });
            break;
            
          case "deepseek-R1":
            // Deepseek API call
            console.log("API Request (Deepseek):", {
              model: "deepseek-R1",
              temperature: states.temperature,
              max_tokens: states.maxTokens,
            });
            
            response = await fetch("https://api.siliconflow.cn/R1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${states.deepseekApiKey}`
              },
              body: JSON.stringify({
                model: "deepseek-R1",
                messages: [{ role: "user", content: fullPrompt }],
                temperature: states.temperature,
                max_tokens: states.maxTokens,
                top_p: states.topP
              })
            });
            break;
            
          default:
            throw new Error(`Unsupported model: ${states.selectedModel}`);
        }
      } else {
        // Logic for Groups A and B remains unchanged
        profileText = states.userProfiles
          .map(p => `${p.dimension}: ${p.content}`)
          .join("\n");
        
        fullPrompt = `Designer Goal: ${states.designerGoal}\nUser Profiles:\n${profileText}\nCustom Prompt: ${states.customPrompt}`;

        console.log("API Request:", {
          apiKey: states.apiKey ? states.apiKey.substring(0, 4) + "..." : "not provided",
          model: "gpt-4o",
          temperature: states.temperature,
          max_tokens: states.maxTokens,
          group: group
        });
        
        response = await fetch("https://api.openai.com/R1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${states.apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "system", content: fullPrompt }],
            temperature: states.temperature,
            max_tokens: states.maxTokens,
            top_p: states.topP
          })
        });
      }

      // Error handling
      if (!response.ok) {
        const errorText = await response.text().catch(e => "Unable to get error details");
        console.error("API Error details:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          throw new Error(`Authentication failed (401): Please check if your API key is correct and valid`);
        } else {
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${response.statusText}`);
        }
      }
      
      // Parse different API response formats
      const data = await response.json();
      let result;
      
      if (group === "C" && states.selectedModel === "claude-3-7-sonnet") {
        // Claude API response format
        result = data.content && data.content[0]?.text || "Generation failed";
      } else if (group === "C" && states.selectedModel === "deepseek-R1") {
        // Deepseek API response format (similar to OpenAI)
        result = data.choices && data.choices[0]?.message?.content || "Generation failed";
      } else {
        // OpenAI API response format (for GPT-4o and GPT-o1)
        result = data.choices && data.choices[0]?.message?.content || "Generation failed";
      }

      states.setDesignGuide(result);
      
      // Store data in Firebase
      let docData;
      
      if (group === "A") {
        // Group A data structure remains unchanged
        docData = {
          designerGoal: states.designerGoal,
          userProfiles: states.userProfiles,
          customPrompt: states.customPrompt,
          prompt: fullPrompt,
          result: result,
          timestamp: new Date(),
          temperature: temperatureA,
          maxTokens: maxTokensA,
          topP: topPA,
          designerNotes: designerNotes
        };
      } else if (group === "B") {
        // Group B data structure remains unchanged
        docData = {
          designerGoal: states.designerGoal,
          userProfiles: states.userProfiles,
          customPrompt: states.customPrompt,
          prompt: fullPrompt,
          result: result,
          timestamp: new Date(),
          temperature: temperatureB,
          maxTokens: maxTokensB,
          topP: topPB,
          userFeedback: "",
          suggestedDimensions: ""
        };
      } else if (group === "C") {
        // Group C data structure with added model information
        docData = {
          designerGoal: states.designerGoal,
          userProfile: states.userProfile,
          customPrompt: states.customPrompt,
          prompt: fullPrompt,
          result: result,
          timestamp: new Date(),
          temperature: temperatureC,
          maxTokens: maxTokensC,
          topP: topPC,
          userId: states.userId,
          modelUsed: states.selectedModel,
          userEvaluation: ""
        };
      }

      const collectionRef = collection(db, `group${group}`);
      const docRef = await addDoc(collectionRef, docData);
      states.setCurrentDocId(docRef.id);
      
    } catch (error) {
      console.error("API Error:", error);
      states.setDesignGuide(`Error: ${error.message}`);
      if (group === "C") {
        states.setApiError(error.message);
      }
    } finally {
      states.setLoading(false);
    }
  };

  // Generate suggested dimensions
  const generateSuggestedDimensions = async () => {
    if (!userFeedback.trim() || !apiKeyB) {
      setSuggestedDimensions("Please provide feedback and API key");
      return;
    }

    if (!currentDocIdB) {
      setSuggestedDimensions("No design guide generated yet. Please generate a design guide first.");
      return;
    }

    setLoadingB(true);
    try {
      console.log("Generate Suggested Dimensions - API Request:", {
        apiKey: apiKeyB ? apiKeyB.substring(0, 4) + "..." : "not provided",
        feedback: userFeedback ? userFeedback.substring(0, 20) + "..." : "empty"
      });
      
      const response = await fetch("https://api.openai.com/R1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKeyB}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{
            role: "system",
            content: `Analyze the following user feedback and extract relevant user dimension phrases.

User Feedback: "${userFeedback}"

Extract dimensions that the user actually mentions or cares about.
IMPORTANT: For EACH dimension, you MUST include a brief clarification in parentheses.

Format EXACTLY like this:
Dimension Name (specific details to provide here)
Another Dimension (what user should enter here)

Examples:
Color Preference (preferred colors and combinations)
Work Style (remote/office/hybrid preferences)
Space Requirements (square footage needed and layout preferences)

Each dimension must:
1. Be directly extracted from the user's feedback
2. Be concise (2-3 words) for the dimension name
3. Reflect actual aspects that the user is concerned about
4. ALWAYS include parentheses with clear guidance on what information to provide

Return ONLY the formatted dimensions, one per line.`
          }],
          temperature: temperatureB,
          max_tokens: maxTokensB,
          top_p: topPB
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(e => "Unable to get error details");
        console.error("Suggest Dimensions API Error details:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          throw new Error(`Authentication failed (401): Please check if your API key is correct and valid`);
        } else {
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      const dimensions = data.choices[0]?.message?.content || "Generation failed";
      
      setSuggestedDimensions(dimensions);
      
      const docRef = doc(db, "groupB", currentDocIdB);
      await updateDoc(docRef, {
        userFeedback: userFeedback,
        suggestedDimensions: dimensions,
        feedbackTimestamp: new Date()
      });
    } catch (error) {
      console.error("Generation failed:", error);
      setSuggestedDimensions(`Error: ${error.message}`);
    } finally {
      setLoadingB(false);
    }
  };

  // UI Components
  const renderGroupA = () => (
    <>
      <div className="left-section">
        <h2>Designer Goal</h2>
        <textarea
          placeholder="Enter AI designer goal..."
          value={designerGoalA}
          onChange={(e) => setDesignerGoalA(e.target.value)}
        />
        <h2>User Dimensions</h2>
        {userProfilesA.map((profile, index) => (
          <div key={index} className="user-profile-container">
            <input
              className="user-dimension"
              value={profile.dimension}
              onChange={(e) => updateUserProfile("A", index, "dimension", e.target.value)}
              placeholder="Dimension name"
            />
            <textarea
              className="user-content"
              value={profile.content}
              onChange={(e) => updateUserProfile("A", index, "content", e.target.value)}
              placeholder="Dimension content..."
            />
          </div>
        ))}
        <button className="small-button" onClick={() => addUserProfile("A")}>
          Add Dimension
        </button>
        <h2>Custom Prompt</h2>
        <textarea
          placeholder="Enter custom prompt..."
          value={customPromptA}
          onChange={(e) => setCustomPromptA(e.target.value)}
        />
        <h2>OpenAI API Key</h2>
        <input
          type="password"
          placeholder="Enter API key..."
          value={apiKeyA}
          onChange={(e) => setApiKeyA(e.target.value)}
        />
        <button 
          className="full-width generate-button"
          onClick={() => generateDesignGuide("A")}
          disabled={loadingA}
        >
          {loadingA ? "Generating..." : "Generate Design Guide"}
        </button>
      </div>

      <div className="right-section expanded">
        <h2 className="guide-header">
          Design Guide
          <button 
            className="copy-button" 
            onClick={() => copyToClipboard(designGuideA)}
          >
            Copy
          </button>
        </h2>
        <textarea 
          className="design-guide-box"
          readOnly
          value={designGuideA}
          placeholder="Generated content will appear here..."
        />

        <h2 className="notes-header">
          Expert Notes
          <button 
            className={`copy-button ${savingNotes ? 'saving' : ''}`}
            onClick={saveDesignerNotes}
            disabled={savingNotes}
          >
            {savingNotes ? "Saving..." : "Save"}
          </button>
        </h2>
        <textarea
          className="notes-box"
          placeholder="Enter expert notes..."
          value={designerNotes}
          onChange={(e) => setDesignerNotes(e.target.value)}
        />
      </div>
    </>
  );

  // UI Component for Group B
  const renderGroupB = () => (
    <>
      <div className="left-section">
        <h2>Designer Goal</h2>
        <textarea
          placeholder="Enter AI designer goal..."
          value={designerGoalB}
          onChange={(e) => setDesignerGoalB(e.target.value)}
        />
        <h2>User Dimensions</h2>
        {userProfilesB.map((profile, index) => (
          <div key={index} className="user-profile-container">
            <input
              className="user-dimension"
              value={profile.dimension}
              onChange={(e) => updateUserProfile("B", index, "dimension", e.target.value)}
              placeholder="Dimension name"
            />
            <textarea
              className="user-content"
              value={profile.content}
              onChange={(e) => updateUserProfile("B", index, "content", e.target.value)}
              placeholder="Dimension content..."
            />
          </div>
        ))}
        <button className="small-button" onClick={() => addUserProfile("B")}>
          Add Dimension
        </button>
        <h2>Custom Prompt</h2>
        <textarea
          placeholder="Enter custom prompt..."
          value={customPromptB}
          onChange={(e) => setCustomPromptB(e.target.value)}
        />
        <h2>OpenAI API Key</h2>
        <input
          type="password"
          placeholder="Enter API key..."
          value={apiKeyB}
          onChange={(e) => setApiKeyB(e.target.value)}
        />
        <button 
          className="full-width generate-button"
          onClick={() => generateDesignGuide("B")}
          disabled={loadingB}
        >
          {loadingB ? "Generating..." : "Generate Design Guide"}
        </button>
      </div>

      <div className="right-section expanded">
        <h2 className="guide-header">
          Design Guide
          <button 
            className="copy-button" 
            onClick={() => copyToClipboard(designGuideB)}
          >
            Copy
          </button>
        </h2>
        <textarea 
          className="design-guide-box"
          readOnly
          value={designGuideB}
          placeholder="Generated content will appear here..."
        />

        <div className="feedback-section">
          <h2 className="feedback-header">User Feedback</h2>
          <textarea
            className="feedback-box"
            placeholder="Enter your feedback..."
            value={userFeedback}
            onChange={(e) => setUserFeedback(e.target.value)}
          />
          <button 
            className="generate-dimensions-button" 
            onClick={generateSuggestedDimensions}
            disabled={loadingB}
          >
            {loadingB ? "Generating..." : "Suggest New Dimensions"}
          </button>
          
          <h2 className="suggested-dimensions-header">Suggested Dimensions</h2>
          <textarea
            className="suggested-dimensions-box"
            readOnly
            value={suggestedDimensions}
            placeholder="Short dimension phrases will appear here (one per line)..."
          />
        </div>
      </div>
    </>
  );
// UI Component for Group C
const renderGroupC = () => (
  <>
    <div className="left-section">
      <h2>Designer Goal</h2>
      <textarea
        placeholder="Enter AI designer goal..."
        value={designerGoalC}
        onChange={(e) => setDesignerGoalC(e.target.value)}
      />

      <h2>User Dimensions</h2>
      <textarea
        className="user-profile-box"
        placeholder="Enter complete user profile information..."
        value={userProfileC}
        onChange={(e) => setUserProfileC(e.target.value)}
      />

      <h2>Custom Prompt</h2>
      <textarea
        placeholder="Enter custom prompt..."
        value={customPromptC}
        onChange={(e) => setCustomPromptC(e.target.value)}
      />

      <h2>Digital Clone User ID</h2>
      <input
        placeholder="Enter user ID (e.g. C1, C2, C3, etc.)..."
        value={userIdC}
        onChange={(e) => setUserIdC(e.target.value)}
      />

      <h2>Select AI Model</h2>
      <select 
        className="model-select"
        value={selectedModelC}
        onChange={(e) => setSelectedModelC(e.target.value)}
      >
        <option value="gpt-4o">OpenAI GPT-4o</option>
        <option value="gpt-o1">OpenAI GPT-o1</option>
        <option value="claude-3-7-sonnet">Claude 3.7 Sonnet</option>
        <option value="deepseek-R1">Deepseek R1</option>
      </select>
      
      {(selectedModelC === "gpt-4o" || selectedModelC === "gpt-o1") && (
        <>
          <h2>OpenAI API Key</h2>
          <input
            type="password"
            placeholder="Enter OpenAI API key..."
            value={apiKeyC}
            onChange={(e) => setApiKeyC(e.target.value)}
          />
        </>
      )}
      
      {selectedModelC === "claude-3-7-sonnet" && (
        <>
          <h2>Anthropic API Key</h2>
          <input
            type="password"
            placeholder="Enter Claude API key..."
            value={claudeApiKeyC}
            onChange={(e) => setClaudeApiKeyC(e.target.value)}
          />
        </>
      )}
      
      {selectedModelC === "deepseek-R1" && (
        <>
          <h2>Deepseek API Key</h2>
          <input
            type="password"
            placeholder="Enter Deepseek API key..."
            value={deepseekApiKeyC}
            onChange={(e) => setDeepseekApiKeyC(e.target.value)}
          />
        </>
      )}
      
      {apiErrorC && (
        <div className="api-error">
          Error: {apiErrorC}
        </div>
      )}
      
      <button 
        className="generate-button"
        onClick={() => generateDesignGuide("C")}
        disabled={loadingC}
      >
        {loadingC ? "Generating..." : "Generate Digital Clone Design Guide"}
      </button>
    </div>

    <div className="right-section expanded">
      <h2 className="guide-header">
        Design Guide for Digital Clone {userIdC || "User"}
        <button 
          className="copy-button" 
          onClick={() => copyToClipboard(designGuideC)}
        >
          Copy
        </button>
      </h2>
      <textarea 
        className="design-guide-box"
        readOnly
        value={designGuideC}
        placeholder="Generated design guide for digital clone will appear here..."
      />

      <h2 className="evaluation-header">
        Real User Evaluation
        <button 
          className="copy-button"
          onClick={saveUserEvaluation}
          disabled={savingEvaluation}
        >
          {savingEvaluation ? "Saving..." : "Save"}
        </button>
      </h2>
      <textarea
        className="notes-box"
        placeholder="Enter real user's evaluation of this digital clone's design guide..."
        value={userEvaluation}
        onChange={(e) => setUserEvaluation(e.target.value)}
      />
    </div>
  </>
);

  return (
    <div className="app-container">
      <h1 className="page-title">Human-AI Collaborative Method for Future-Oriented Design Prompt System</h1>
      
      <div className="layout-container">
        <div className="group-selector">
          <button 
            className={`group-button ${activeGroup === "A" ? "active" : ""}`} 
            onClick={() => setActiveGroup("A")}
          >
            Group A (with Design Expert)
          </button>
          <button 
            className={`group-button ${activeGroup === "B" ? "active" : ""}`} 
            onClick={() => setActiveGroup("B")}
          >
            Group B (without Design Expert)
          </button>
          <button 
            className={`group-button ${activeGroup === "C" ? "active" : ""}`} 
            onClick={() => setActiveGroup("C")}
          >
            Group C (Silicon Sample)
          </button>
        </div>
        
        <div className="container">
          {activeGroup === "A" 
            ? renderGroupA() 
            : activeGroup === "B" 
              ? renderGroupB() 
              : renderGroupC()
          }
        </div>
      </div>

      <style>
        {`
          /* Base styles */
          * {
            box-sizing: border-box;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          
          body {
            margin: 0;
            padding: 0;
            background-color: #f5f5f7;
          }
          
          .app-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .page-title {
            text-align: center;
            margin-bottom: 30px;
            color: #333;
          }
          
          .layout-container {
            display: flex;
            flex-direction: column;
          }
          
          .group-selector {
            display: flex;
            margin-bottom: 20px;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .group-button {
            flex: 1;
            padding: 12px;
            background-color: #e0e0e0;
            border: none;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s;
          }
          
          .group-button.active {
            background-color: #2563eb;
            color: white;
          }
          
          .container {
            display: flex;
            gap: 20px;
          }
          
          .left-section, .right-section {
            flex: 1;
            padding: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .right-section.expanded {
            flex: 1.5;
          }
          
          h2 {
            margin-top: 0;
            margin-bottom: 10px;
            color: #333;
          }
          
          textarea, input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 15px;
            font-size: 14px;
          }
          
          textarea {
            min-height: 100px;
            resize: vertical;
          }
          
          .design-guide-box {
            min-height: 300px;
            background-color: #f9f9f9;
          }
          
          .notes-box {
            min-height: 200px;
          }
          
          .guide-header, .notes-header, .feedback-header, .suggested-dimensions-header, .evaluation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          
          .copy-button {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          }
          
          .copy-button.saving {
            background-color: #16a34a;
          }
          
          .copy-button:disabled {
            background-color: #9ca3af;
            cursor: not-allowed;
          }
          
          .user-profile-container {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
          }
          
          .user-dimension {
            flex: 0 0 150px;
            min-height: 38px;
          }
          
          .user-content {
            flex: 1;
            min-height: 38px;
          }
          
          .small-button {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            color: #374151;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            margin-bottom: 15px;
          }
          
          .generate-button {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            margin-top: 10px;
          }
          
          .generate-button:disabled {
            background-color: #9ca3af;
            cursor: not-allowed;
          }
          
          .full-width {
            width: 100%;
          }
          
          .feedback-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
          
          .feedback-box, .suggested-dimensions-box {
            min-height: 150px;
          }
          
          .generate-dimensions-button {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin: 10px 0;
            font-weight: 500;
          }
          
          .generate-dimensions-button:disabled {
            background-color: #9ca3af;
            cursor: not-allowed;
          }
          
          .user-profile-box {
            min-height: 150px;
          }
          
          .model-select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 15px;
            font-size: 14px;
            background-color: white;
          }
          
          .api-error {
            background-color: #fee2e2;
            color: #b91c1c;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
            font-size: 14px;
          }
          
          /* Responsive layout */
          @media (max-width: 1024px) {
            .container {
              flex-direction: column;
            }
            
            .left-section, .right-section {
              width: 100%;
            }
            
            .right-section.expanded {
              flex: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

export default App;