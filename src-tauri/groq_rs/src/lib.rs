mod message;
pub use message::*;
use reqwest::{
    blocking::multipart::{Form, Part},
    blocking::{Client, Response},
    multipart::{Form as AForm, Part as APart},
    Client as AClient, Response as AResponse,
};
use serde_json::{json, Value};
use std::sync::Arc;

/// An asynchronous client for interacting with the Groq API.
///
/// # Parameters
///
/// - `api_key`: The API key for authenticating with the Groq API.
/// - `endpoint`: The URL of the Groq API endpoint. If not provided, it defaults to <https://api.groq.com/openai/v1>.
///
/// # Returns
///
/// An instance of `AsyncGroqClient` configured with the provided API key and endpoint.
///
/// # Example
///
///```
/// use groq_client::AsyncGroqClient;
///
/// let client = AsyncGroqClient::new("my_api_key".to_string(), None).await;
///```
pub struct AsyncGroqClient {
    api_key: String,
    client: Arc<AClient>,
    endpoint: String,
}

impl AsyncGroqClient {
    /// Creates a new `AsyncGroqClient`
    pub async fn new(api_key: String, endpoint: Option<String>) -> Self {
        let ep = endpoint.unwrap_or_else(|| String::from("https://api.groq.com/openai/v1"));
        Self {
            api_key,
            client: Arc::new(AClient::new()),
            endpoint: ep,
        }
    }

    /// Sends a request to the Groq API with the provided JSON body and returns the parsed response.
    ///
    /// # Parameters
    ///
    /// - `body`: The JSON body to send in the request.
    /// - `link`: The URL link to send the request to.
    ///
    /// # Returns
    ///
    /// The parsed JSON response from the Groq API.
    async fn send_request(&self, body: Value, link: &str) -> Result<Value, GroqError> {
        let res = self
            .client
            .post(link)
            .header("Content-Type", "application/json")
            .header("Authorization", &format!("Bearer {}", self.api_key))
            .json(&body)
            .send()
            .await?;

        self.parse_response(res).await
    }

    /// Sends a speech-to-text request to the Groq API and returns the parsed response.
    ///
    /// # Parameters
    ///
    /// - `request`: The `SpeechToTextRequest` containing the audio file, temperature, language, and other options.
    ///
    /// # Returns
    ///
    /// The parsed `SpeechToTextResponse` from the Groq API.
    pub async fn speech_to_text(
        &self,
        request: SpeechToTextRequest,
    ) -> Result<SpeechToTextResponse, GroqError> {
        let file = request.file;
        let temperature = request.temperature;
        let language = request.language;
        let english_text = request.english_text;
        let model = request.model;

        let mut form = AForm::new().part("file", APart::bytes(file).file_name("audio.wav"));
        if let Some(temp) = temperature {
            form = form.text("temperature", temp.to_string());
        }
        if let Some(lang) = language {
            form = form.text("language", lang);
        }

        let link_addition = if english_text {
            "/audio/translations"
        } else {
            "/audio/transcriptions"
        };
        if let Some(mdl) = model {
            form = form.text("model", mdl);
        }

        let link = format!("{}{}", self.endpoint, link_addition);
        let response = self
            .client
            .post(&link)
            .header("Authorization", &format!("Bearer {}", self.api_key))
            .multipart(form)
            .send()
            .await?;

        let speech_to_text_response: SpeechToTextResponse = response.json().await?;
        Ok(speech_to_text_response)
    }

    /// Sends a chat completion request to the Groq API and returns the parsed response.
    ///
    /// # Parameters
    ///
    /// - `request`: The `ChatCompletionRequest` containing the model, messages, temperature, max tokens, top-p, and other options.
    ///
    /// # Returns
    ///
    /// The parsed `ChatCompletionResponse` from the Groq API.
    pub async fn chat_completion(
        &self,
        request: ChatCompletionRequest,
    ) -> Result<ChatCompletionResponse, GroqError> {
        let messages = request
            .messages
            .iter()
            .map(|m| {
                let mut msg_json = json!({
                    "role": m.role,
                    "content": m.content,
                });
                if let Some(name) = &m.name {
                    msg_json["name"] = json!(name);
                }
                msg_json
            })
            .collect::<Vec<Value>>();

        let mut body = json!({
            "model": request.model,
            "messages": messages,
            "temperature": request.temperature.unwrap_or(1.0),
            "max_tokens": request.max_tokens.unwrap_or(1024),
            "top_p": request.top_p.unwrap_or(1.0),
            "stream": request.stream.unwrap_or(false),
        });

        if let Some(stop) = &request.stop {
            body["stop"] = json!(stop);
        }
        if let Some(seed) = &request.seed {
            body["seed"] = json!(seed);
        }

        let response = self
            .send_request(body, &format!("{}/chat/completions", self.endpoint))
            .await?;
        let chat_completion_response: ChatCompletionResponse = serde_json::from_value(response)?;
        Ok(chat_completion_response)
    }

    /// Parses the response from a Groq API request and returns the response body as a JSON value.
    ///
    /// # Parameters
    ///
    /// - `response`: The HTTP response from the Groq API request.
    ///
    /// # Returns
    ///
    /// The parsed JSON value from the response body, or a `GroqError` if the response was not successful.
    async fn parse_response(&self, response: AResponse) -> Result<Value, GroqError> {
        let status = response.status();
        let body: Value = response.json().await?;

        if !status.is_success() {
            if let Some(error) = body.get("error") {
                return Err(GroqError::ApiError {
                    message: error["message"]
                        .as_str()
                        .unwrap_or("Unknown error")
                        .to_string(),
                    type_: error["type"]
                        .as_str()
                        .unwrap_or("unknown_error")
                        .to_string(),
                });
            }
        }

        Ok(body)
    }

    pub async fn text_to_speech(
        &self,
        request: TextToSpeechRequest,
    ) -> Result<TextToSpeechResponse, GroqError> {
        let body = json!({
            "model": request.model,
            "input": request.input,
            "voice": request.voice,
            "speed": request.speed.unwrap_or(1.0),
        });

        let response = self
            .client // Use the async client field
            .post(&format!("{}/audio/speech", self.endpoint))
            .header("Content-Type", "application/json")
            .header("Authorization", &format!("Bearer {}", self.api_key))
            .json(&body)
            .send()
            .await?; // Use .await

        let status = response.status();

        if !status.is_success() {
            // Try to parse error as JSON using .await
            let error_body: Result<Value, _> = response.json().await; // Use .await
            if let Ok(body) = error_body {
                if let Some(error) = body.get("error") {
                    return Err(GroqError::ApiError {
                        message: error["message"]
                            .as_str()
                            .unwrap_or("Unknown error")
                            .to_string(),
                        type_: error["type"]
                            .as_str()
                            .unwrap_or("unknown_error")
                            .to_string(),
                    });
                }
            }
            return Err(GroqError::ApiError {
                message: format!("Request failed with status code: {}", status),
                type_: "request_error".to_string(),
            });
        }

        // Get binary data directly using .await
        let audio_data = response.bytes().await?.to_vec(); // Use .await

        Ok(TextToSpeechResponse { audio_data })
    }
}

/// An client for interacting with the Groq API.
///
/// # Parameters
///
/// - `api_key`: The API key for authenticating with the Groq API.
/// - `endpoint`: The URL of the Groq API endpoint. If not provided, it defaults to <https://api.groq.com/openai/v1>.
///
/// # Returns
///
/// An instance of `GroqClient` configured with the provided API key and endpoint.
///
/// # Example
///
///```
/// use groq_client::GroqClient;
///
/// let client = GroqClient::new("my_api_key".to_string(), None);
///```
pub struct GroqClient {
    api_key: String,
    client: Client,
    endpoint: String,
}

impl GroqClient {
    /// Constructs a new `GroqClient` instance with the provided API key and optional endpoint.
    ///
    /// # Parameters
    ///
    /// - `api_key`: The API key for authenticating with the Groq API.
    /// - `endpoint`: The URL of the Groq API endpoint. If not provided, it defaults to <https://api.groq.com/openai/v1>.
    ///
    /// # Returns
    ///
    /// A new `GroqClient` instance configured with the provided API key and endpoint.
    pub fn new(api_key: String, endpoint: Option<String>) -> Self {
        let ep = endpoint.unwrap_or_else(|| String::from("https://api.groq.com/openai/v1"));
        Self {
            api_key,
            client: Client::new(),
            endpoint: ep,
        }
    }

    /// Sends a request to the Groq API with the provided JSON body and returns the parsed response.
    ///
    /// # Parameters
    ///
    /// - `body`: The JSON body to send in the request.
    /// - `link`: The URL link to send the request to.
    ///
    /// # Returns
    ///
    /// The parsed response from the Groq API as a `Value`.
    ///
    /// # Errors
    ///
    /// Returns a `GroqError` if there is an issue sending the request or parsing the response.
    fn send_request(&self, body: Value, link: &str) -> Result<Value, GroqError> {
        let res = self
            .client
            .post(link)
            .header("Content-Type", "application/json")
            .header("Authorization", &format!("Bearer {}", self.api_key))
            .json(&body)
            .send()?;

        parse_response(res)
    }

    /// Sends a speech-to-text request to the Groq API and returns the parsed response.
    ///
    /// # Parameters
    ///
    /// - `request`: A `SpeechToTextRequest` containing the necessary parameters for the speech-to-text request.
    ///
    /// # Returns
    ///
    /// The parsed `SpeechToTextResponse` from the Groq API.
    ///
    /// # Errors
    ///
    /// Returns a `GroqError` if there is an issue sending the request or parsing the response.
    pub fn speech_to_text(
        &self,
        request: SpeechToTextRequest,
    ) -> Result<SpeechToTextResponse, GroqError> {
        // Extract values from request
        let file = request.file;
        let temperature = request.temperature;
        let language = request.language;
        let english_text = request.english_text;
        let model = request.model;
        let prompt = request.prompt;
        let mut form = Form::new().part("file", Part::bytes(file).file_name("audio.wav"));

        if let Some(temp) = temperature {
            form = form.text("temperature", temp.to_string());
        }

        if let Some(lang) = language {
            form = form.text("language", lang);
        }

        let link_addition = if english_text {
            "/audio/translations"
        } else {
            "/audio/transcriptions"
        };

        if let Some(mdl) = model {
            form = form.text("model", mdl);
        }
        if let Some(prompt) = prompt {
            form = form.text("prompt", prompt.to_string());
        }

        let link = format!("{}{}", self.endpoint, link_addition);
        let response = self
            .client
            .post(link)
            .header("Authorization", &format!("Bearer {}", self.api_key))
            .multipart(form)
            .send()?;

        let speech_to_text_response: SpeechToTextResponse = response.json()?;
        Ok(speech_to_text_response)
    }

    /// Sends a chat completion request to the GROQ API and returns the response.
    ///
    /// # Parameters
    ///
    /// - `request` - A `ChatCompletionRequest` containing the details of the chat completion request.
    ///
    /// # Errors
    ///
    /// Returns a `GroqError` if there is an issue sending the request or parsing the response.
    pub fn chat_completion(
        &self,
        request: ChatCompletionRequest,
    ) -> Result<ChatCompletionResponse, GroqError> {
        let messages = request
            .messages
            .iter()
            .map(|m| {
                let mut msg_json = json!({
                    "role": m.role,
                    "content": m.content,
                });
                if let Some(name) = &m.name {
                    msg_json["name"] = json!(name);
                }
                msg_json
            })
            .collect::<Vec<_>>();

        let mut body = json!({
            "model": request.model,
            "messages": messages,
            "temperature": request.temperature.unwrap_or(1.0),
            "max_tokens": request.max_tokens.unwrap_or(1024),
            "top_p": request.top_p.unwrap_or(1.0),
            "stream": request.stream.unwrap_or(false),
        });

        if let Some(stop) = &request.stop {
            body["stop"] = json!(stop);
        }
        if let Some(seed) = &request.seed {
            body["seed"] = json!(seed);
        }

        let response = self.send_request(body, &format!("{}/chat/completions", self.endpoint))?;
        let chat_completion_response: ChatCompletionResponse = serde_json::from_value(response)?;
        Ok(chat_completion_response)
    }

    pub fn text_to_speech(
        &self,
        request: TextToSpeechRequest,
    ) -> Result<TextToSpeechResponse, GroqError> {
        let body = json!({
            "model": request.model,
            "input": request.input,
            "voice": request.voice,
            "speed": request.speed.unwrap_or(1.0),
        });

        // We can't use the send_request method directly since it expects a JSON response
        // Instead, let's use the client setup logic similar to send_request
        let response = self
            .client
            .post(&format!("{}/audio/speech", self.endpoint))
            .header("Content-Type", "application/json")
            .header("Authorization", &format!("Bearer {}", self.api_key))
            .json(&body)
            .send()?;

        let status = response.status();

        // Handle error cases in a similar way to parse_response
        if !status.is_success() {
            // Try to parse error as JSON if possible
            let error_body: Result<Value, _> = response.json();
            if let Ok(body) = error_body {
                if let Some(error) = body.get("error") {
                    return Err(GroqError::ApiError {
                        message: error["message"]
                            .as_str()
                            .unwrap_or("Unknown error")
                            .to_string(),
                        type_: error["type"]
                            .as_str()
                            .unwrap_or("unknown_error")
                            .to_string(),
                    });
                }
            }
            // If we couldn't parse JSON error, return a generic error
            return Err(GroqError::ApiError {
                message: format!("Request failed with status code: {}", status),
                type_: "request_error".to_string(),
            });
        }

        // Get binary data directly
        let audio_data = response.bytes()?.to_vec();

        Ok(TextToSpeechResponse { audio_data })
    }
}

/// Parses the response from a GROQ API request and returns the response body as a JSON value.
///
/// # Parameters
///
/// - `response` - The HTTP response from the GROQ API request.
///
/// # Errors
///
/// Returns a `GroqError` if the response status is not successful or if there is an error parsing the response body.
///
/// # Returns
///
/// The response body as a JSON value.
fn parse_response(response: Response) -> Result<Value, GroqError> {
    let status = response.status();
    let body: Value = response.json()?;

    if !status.is_success() {
        if let Some(error) = body.get("error") {
            return Err(GroqError::ApiError {
                message: error["message"]
                    .as_str()
                    .unwrap_or("Unknown error")
                    .to_string(),
                type_: error["type"]
                    .as_str()
                    .unwrap_or("unknown_error")
                    .to_string(),
            });
        }
    }

    Ok(body)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::File;
    use std::io::Read;
    use tokio;

    #[test]
    fn test_chat_completion() {
        let api_key = std::env::var("GROQ_API_KEY").unwrap();
        let client = GroqClient::new(api_key.to_string(), None);
        let messages = vec![ChatCompletionMessage {
            role: ChatCompletionRoles::User,
            content: "Hello".to_string(),
            name: None,
        }];
        let request = ChatCompletionRequest::new("llama3-70b-8192", messages);
        let response = client.chat_completion(request).unwrap();
        println!("{:?}", response);
        assert!(!response.choices.is_empty());
    }

    #[test]
    fn test_speech_to_text() {
        let api_key = std::env::var("GROQ_API_KEY").unwrap();
        let client = GroqClient::new(api_key.to_string(), None);
        let audio_file_path = "onepiece_demo.mp4";
        let mut file = File::open(audio_file_path).expect("Failed to open audio file");
        let mut audio_data = Vec::new();
        file.read_to_end(&mut audio_data)
            .expect("Failed to read audio file");
        let request = SpeechToTextRequest::new(audio_data)
            .temperature(0.7)
            .language("en")
            .model("whisper-large-v3");
        let response = client
            .speech_to_text(request)
            .expect("Failed to get response");
        println!("Speech to Text Response: {}", response.text);
        assert!(!response.text.is_empty());
    }

    #[tokio::test]
    async fn test_async_chat_completion() {
        let api_key = std::env::var("GROQ_API_KEY").unwrap();
        let client = AsyncGroqClient::new(api_key, None).await;

        let messages1 = vec![ChatCompletionMessage {
            role: ChatCompletionRoles::User,
            content: "Hello".to_string(),
            name: None,
        }];
        let request1 = ChatCompletionRequest::new("llama3-70b-8192", messages1);

        let messages2 = vec![ChatCompletionMessage {
            role: ChatCompletionRoles::User,
            content: "How are you?".to_string(),
            name: None,
        }];
        let request2 = ChatCompletionRequest::new("llama3-70b-8192", messages2);

        let (response1, response2) = tokio::join!(
            client.chat_completion(request1),
            client.chat_completion(request2)
        );

        let response1 = response1.expect("Failed to get response for request 1");
        let response2 = response2.expect("Failed to get response for request 2");

        println!("Response 1: {}", response1.choices[0].message.content);
        println!("Response 2: {}", response2.choices[0].message.content);

        assert!(!response1.choices.is_empty());
        assert!(!response2.choices.is_empty());
    }

    #[tokio::test]
    async fn test_async_speech_to_text() {
        let api_key = std::env::var("GROQ_API_KEY").unwrap();
        let client = AsyncGroqClient::new(api_key, None).await;

        let audio_file_path1 = "onepiece_demo.mp4";
        let audio_file_path2 = "save.ogg";

        let (audio_data1, audio_data2) = tokio::join!(
            tokio::fs::read(audio_file_path1),
            tokio::fs::read(audio_file_path2)
        );

        let audio_data1 = audio_data1.expect("Failed to read first audio file");
        let audio_data2 = audio_data2.expect("Failed to read second audio file");

        let (request1, request2) = (
            SpeechToTextRequest::new(audio_data1)
                .temperature(0.7)
                .language("en")
                .model("whisper-large-v3"),
            SpeechToTextRequest::new(audio_data2)
                .temperature(0.7)
                .language("en")
                .model("whisper-large-v3"),
        );
        let (response1, response2) = tokio::join!(
            client.speech_to_text(request1),
            client.speech_to_text(request2)
        );

        let response1 = response1.expect("Failed to get response for first audio");
        let response2 = response2.expect("Failed to get response for second audio");

        println!("Speech to Text Response 1: {:?}", response1);
        println!("Speech to Text Response 2: {:?}", response2);

        assert!(!response1.text.is_empty());
        assert!(!response2.text.is_empty());
    }
}
