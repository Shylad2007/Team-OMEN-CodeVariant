import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.routers import decision_intelligence

class DecisionIntelligenceTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        # Clear cache before each test
        decision_intelligence._guidance_cache.clear()

    def test_deterministic_guidance_electronics_repair(self):
        """Scenario 1: Normal repair with known costs in deterministic fallback."""
        with patch("app.routers.decision_intelligence.is_gemini_configured", return_value=False):
            payload = {
                "item_name": "ThinkPad T480",
                "category": "electronics",
                "condition": "partially_functional",
                "reported_fault": "Battery drains quickly after 30 minutes",
                "recommended_outcome": "repair",
                "selected_outcome": "repair",
                "repair_cost": 2500,
                "replacement_cost": 45000,
                "primary_priority": "save_money"
            }
            res = self.client.post("/api/assessments/ai-guidance", json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertFalse(data["ai_available"])
            self.assertEqual(data["source"], "deterministic-rules-engine")
            self.assertIn("summary_verdict", data)
            self.assertTrue(len(data["practical_steps"]) >= 3)
            self.assertTrue(len(data["safety_cautions"]) >= 2)
            self.assertIn("₹42,500", data["cost_carbon_insight"])

    def test_deterministic_guidance_swollen_hazard(self):
        """Scenario 3: Swollen battery triggers critical safety cautions."""
        with patch("app.routers.decision_intelligence.is_gemini_configured", return_value=False):
            payload = {
                "item_name": "Old Smartphone",
                "category": "electronics",
                "condition": "broken_non_functional",
                "reported_fault": "Battery is swollen and popping out the back cover",
                "recommended_outcome": "recycle",
                "selected_outcome": "recycle",
                "primary_priority": "reduce_waste"
            }
            res = self.client.post("/api/assessments/ai-guidance", json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(any("swelling" in c.lower() or "lithium" in c.lower() for c in data["safety_cautions"]))

    def test_non_hazardous_burners_and_plugs_avoid_false_alarms(self):
        """Verify that stove burners, spark plugs, and regular battery items do not trigger false hazard alerts."""
        with patch("app.routers.decision_intelligence.is_gemini_configured", return_value=False):
            # Gas stove burner
            payload_burner = {
                "item_name": "Gas Cooktop 4-Burner",
                "category": "appliances",
                "condition": "partially_functional",
                "reported_fault": "Left gas burner is clogged with grease and hard to light",
                "recommended_outcome": "repair",
                "selected_outcome": "repair",
            }
            res = self.client.post("/api/assessments/ai-guidance", json=payload_burner)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertFalse(any("CRITICAL HAZARD" in c for c in data["safety_cautions"]), "Stove burner must not trigger CRITICAL HAZARD")

            # Lawn mower spark plug
            payload_spark = {
                "item_name": "Lawn Mower",
                "category": "tools",
                "condition": "partially_functional",
                "reported_fault": "Engine sputters; fouled spark plug needs cleaning or swap",
                "recommended_outcome": "repair",
                "selected_outcome": "repair",
            }
            res = self.client.post("/api/assessments/ai-guidance", json=payload_spark)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertFalse(any("CRITICAL HAZARD" in c for c in data["safety_cautions"]), "Spark plug must not trigger CRITICAL HAZARD")

    def test_missing_costs_acknowledgement(self):
        """Scenario 2: Missing cost and lifespan information are not fabricated."""
        with patch("app.routers.decision_intelligence.is_gemini_configured", return_value=False):
            payload = {
                "item_name": "Dining Table",
                "category": "furniture",
                "condition": "partially_functional",
                "reported_fault": "One leg has a loose joint and wobbles",
                "recommended_outcome": "repair",
                "selected_outcome": "repair",
                "repair_cost_unknown": True,
                "replacement_cost_unknown": True,
            }
            res = self.client.post("/api/assessments/ai-guidance", json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("REPAIR", data["cost_carbon_insight"])
            self.assertNotIn("₹", data["cost_carbon_insight"])

    def test_expensive_repair_relative_to_replacement(self):
        """Scenario 4: Expensive repair exceeding replacement cost."""
        with patch("app.routers.decision_intelligence.is_gemini_configured", return_value=False):
            payload = {
                "item_name": "Budget Microwave",
                "category": "appliances",
                "condition": "broken_non_functional",
                "reported_fault": "Magnetron dead and door latch broken",
                "recommended_outcome": "replace",
                "selected_outcome": "replace",
                "repair_cost": 6500,
                "replacement_cost": 5000,
                "primary_priority": "save_money"
            }
            res = self.client.post("/api/assessments/ai-guidance", json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("exceeds standard replacement outlay", data["cost_carbon_insight"])

    def test_mocked_gemini_successful_guidance(self):
        """Scenario 8 & 9: Successful Gemini response with mock and correct source attribution."""
        mock_response = MagicMock()
        mock_response.text = '{"summary_verdict": "Mocked verdict for Philips Coffee Maker.", "practical_steps": ["Check gasket", "Descale"], "safety_cautions": ["Unplug first"], "cost_carbon_insight": "Saves money."}'
        
        with patch("app.routers.decision_intelligence.is_gemini_configured", return_value=True), \
             patch("google.genai.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value = mock_client
            mock_client.models.generate_content.return_value = mock_response

            payload = {
                "item_name": "Philips Coffee Maker",
                "category": "appliances",
                "condition": "fair",
                "reported_fault": "Gasket leakage",
                "recommended_outcome": "repair",
                "selected_outcome": "repair",
                "repair_cost": 300,
                "replacement_cost": 2200,
            }
            res = self.client.post("/api/assessments/ai-guidance", json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data["ai_available"])
            self.assertIn("gemini", data["source"].lower())
            self.assertEqual(data["summary_verdict"], "Mocked verdict for Philips Coffee Maker.")

    def test_mocked_gemini_malformed_response_fallback(self):
        """Scenario 8: Malformed AI output safely falls back to deterministic guidance."""
        mock_response = MagicMock()
        mock_response.text = "NOT VALID JSON AT ALL {[[ malformed"
        
        with patch("app.routers.decision_intelligence.is_gemini_configured", return_value=True), \
             patch("google.genai.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value = mock_client
            mock_client.models.generate_content.return_value = mock_response

            payload = {
                "item_name": "Kitchen Blender",
                "category": "appliances",
                "condition": "fair",
                "reported_fault": "Blades stuck",
                "recommended_outcome": "repair",
                "selected_outcome": "repair"
            }
            res = self.client.post("/api/assessments/ai-guidance", json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertFalse(data["ai_available"])
            self.assertEqual(data["source"], "deterministic-rules-engine")
            self.assertIn("Deterministic fallback active", data.get("note", ""))

    def test_mocked_gemini_quota_rate_limit_fallback(self):
        """Scenario 7: 429 quota exhaustion gracefully falls back without crashing."""
        with patch("app.routers.decision_intelligence.is_gemini_configured", return_value=True), \
             patch("google.genai.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value = mock_client
            mock_client.models.generate_content.side_effect = Exception("429 ResourceExhausted: Quota exceeded for model")

            payload = {
                "item_name": "Toaster",
                "category": "appliances",
                "condition": "fair",
                "reported_fault": "Heating wire broken",
                "recommended_outcome": "repair",
                "selected_outcome": "repair"
            }
            res = self.client.post("/api/assessments/ai-guidance", json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertFalse(data["ai_available"])
            self.assertEqual(data["source"], "deterministic-rules-engine")
            self.assertIn("quota or rate limit reached", data.get("note", "").lower())

    def test_in_memory_caching_prevents_duplicate_calls(self):
        """Scenario 5: In-memory cache returns identical request without calling external client twice."""
        mock_response = MagicMock()
        mock_response.text = '{"summary_verdict": "Cached verdict", "practical_steps": ["Step 1"], "safety_cautions": ["Caution 1"], "cost_carbon_insight": "Insight"}'
        
        with patch("app.routers.decision_intelligence.is_gemini_configured", return_value=True), \
             patch("google.genai.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value = mock_client
            mock_client.models.generate_content.return_value = mock_response

            payload = {
                "item_name": "Cached Monitor",
                "category": "electronics",
                "condition": "fair",
                "reported_fault": "Flickering screen",
                "recommended_outcome": "repair",
                "selected_outcome": "repair"
            }
            # First call
            res1 = self.client.post("/api/assessments/ai-guidance", json=payload)
            self.assertEqual(res1.status_code, 200)
            # Second call
            res2 = self.client.post("/api/assessments/ai-guidance", json=payload)
            self.assertEqual(res2.status_code, 200)
            # Verify mock was only called once
            self.assertEqual(mock_client.models.generate_content.call_count, 1)

if __name__ == "__main__":
    unittest.main()
