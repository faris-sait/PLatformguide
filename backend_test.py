#!/usr/bin/env python3
"""
SaaS Scout Backend API Testing
Tests all endpoints with comprehensive validation
"""

import requests
import sys
import json
from typing import Dict, List, Any

class SaaSScoutAPITester:
    def __init__(self, base_url="https://compare-saas.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.expected_categories = ["Database", "Email", "Hosting", "LLM/AI"]
        self.expected_services_count = 17

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED {details}")
        else:
            print(f"❌ {name}: FAILED {details}")
        return success

    def test_root_endpoint(self) -> bool:
        """Test root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            
            if success and "message" in data:
                return self.log_test("Root Endpoint", True, f"- Message: {data['message']}")
            else:
                return self.log_test("Root Endpoint", False, f"- Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Root Endpoint", False, f"- Error: {str(e)}")

    def test_get_all_services(self) -> Dict[str, Any]:
        """Test GET /api/services endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/services", timeout=10)
            success = response.status_code == 200
            
            if not success:
                self.log_test("Get All Services", False, f"- Status: {response.status_code}")
                return {"success": False, "data": []}
            
            data = response.json()
            
            # Validate service count
            if len(data) < self.expected_services_count:
                self.log_test("Get All Services", False, f"- Expected {self.expected_services_count}+ services, got {len(data)}")
                return {"success": False, "data": data}
            
            # Validate service structure
            required_fields = ["id", "name", "category", "description", "tiers", "advantages", "link"]
            for service in data[:3]:  # Check first 3 services
                for field in required_fields:
                    if field not in service:
                        self.log_test("Get All Services", False, f"- Missing field '{field}' in service")
                        return {"success": False, "data": data}
            
            # Validate INR pricing
            inr_count = 0
            for service in data:
                for tier in service.get("tiers", []):
                    if "₹" in tier.get("price", ""):
                        inr_count += 1
                        break
            
            if inr_count < len(data) * 0.8:  # At least 80% should have INR pricing
                self.log_test("Get All Services", False, f"- Only {inr_count}/{len(data)} services have INR pricing")
                return {"success": False, "data": data}
            
            self.log_test("Get All Services", True, f"- Found {len(data)} services with proper structure and INR pricing")
            return {"success": True, "data": data}
            
        except Exception as e:
            self.log_test("Get All Services", False, f"- Error: {str(e)}")
            return {"success": False, "data": []}

    def test_get_categories(self) -> bool:
        """Test GET /api/categories endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/categories", timeout=10)
            success = response.status_code == 200
            
            if not success:
                return self.log_test("Get Categories", False, f"- Status: {response.status_code}")
            
            data = response.json()
            categories = data.get("categories", [])
            
            # Check if all expected categories are present
            missing_categories = [cat for cat in self.expected_categories if cat not in categories]
            if missing_categories:
                return self.log_test("Get Categories", False, f"- Missing categories: {missing_categories}")
            
            return self.log_test("Get Categories", True, f"- Found categories: {categories}")
            
        except Exception as e:
            return self.log_test("Get Categories", False, f"- Error: {str(e)}")

    def test_get_cheapest(self) -> bool:
        """Test GET /api/cheapest endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/cheapest", timeout=10)
            success = response.status_code == 200
            
            if not success:
                return self.log_test("Get Cheapest Services", False, f"- Status: {response.status_code}")
            
            data = response.json()
            
            # Validate structure
            for category in self.expected_categories:
                if category not in data:
                    return self.log_test("Get Cheapest Services", False, f"- Missing category: {category}")
                
                cheapest = data[category]
                if not isinstance(cheapest, dict) or "service" not in cheapest:
                    return self.log_test("Get Cheapest Services", False, f"- Invalid structure for {category}")
            
            return self.log_test("Get Cheapest Services", True, f"- Found cheapest services for all categories")
            
        except Exception as e:
            return self.log_test("Get Cheapest Services", False, f"- Error: {str(e)}")

    def test_category_filtering(self) -> bool:
        """Test category filtering"""
        try:
            # Test LLM/AI category
            response = requests.get(f"{self.base_url}/api/services?category=LLM/AI", timeout=10)
            success = response.status_code == 200
            
            if not success:
                return self.log_test("Category Filtering", False, f"- Status: {response.status_code}")
            
            data = response.json()
            
            # Validate all services are LLM/AI
            non_llm_services = [s for s in data if s.get("category") != "LLM/AI"]
            if non_llm_services:
                return self.log_test("Category Filtering", False, f"- Found non-LLM/AI services: {[s['name'] for s in non_llm_services]}")
            
            # Should have OpenAI and Anthropic
            service_names = [s.get("name", "") for s in data]
            if "OpenAI" not in service_names or "Anthropic" not in service_names:
                return self.log_test("Category Filtering", False, f"- Missing expected LLM/AI services. Found: {service_names}")
            
            return self.log_test("Category Filtering", True, f"- Found {len(data)} LLM/AI services including OpenAI and Anthropic")
            
        except Exception as e:
            return self.log_test("Category Filtering", False, f"- Error: {str(e)}")

    def test_search_functionality(self) -> bool:
        """Test search functionality"""
        try:
            # Test search for OpenAI
            response = requests.get(f"{self.base_url}/api/services?search=OpenAI", timeout=10)
            success = response.status_code == 200
            
            if not success:
                return self.log_test("Search Functionality", False, f"- Status: {response.status_code}")
            
            data = response.json()
            
            # Should find OpenAI
            openai_found = any(s.get("name") == "OpenAI" for s in data)
            if not openai_found:
                return self.log_test("Search Functionality", False, f"- OpenAI not found in search results")
            
            # Test search for Vercel
            response2 = requests.get(f"{self.base_url}/api/services?search=Vercel", timeout=10)
            if response2.status_code == 200:
                data2 = response2.json()
                vercel_found = any(s.get("name") == "Vercel" for s in data2)
                if not vercel_found:
                    return self.log_test("Search Functionality", False, f"- Vercel not found in search results")
            
            return self.log_test("Search Functionality", True, f"- Search working for OpenAI and Vercel")
            
        except Exception as e:
            return self.log_test("Search Functionality", False, f"- Error: {str(e)}")

    def test_sorting_functionality(self) -> bool:
        """Test sorting functionality"""
        try:
            # Test sort by price ascending
            response = requests.get(f"{self.base_url}/api/services?sort_by=price&sort_order=asc", timeout=10)
            success = response.status_code == 200
            
            if not success:
                return self.log_test("Sorting Functionality", False, f"- Status: {response.status_code}")
            
            data = response.json()
            
            # Check if first service has free tier (should be sorted first)
            if len(data) > 0:
                first_service = data[0]
                first_tier_price = first_service.get("tiers", [{}])[0].get("price", "")
                if "₹0" not in first_tier_price and "Free" not in first_tier_price:
                    return self.log_test("Sorting Functionality", False, f"- First service doesn't have free tier: {first_tier_price}")
            
            return self.log_test("Sorting Functionality", True, f"- Price sorting working correctly")
            
        except Exception as e:
            return self.log_test("Sorting Functionality", False, f"- Error: {str(e)}")

    def test_specific_services(self) -> bool:
        """Test for specific expected services"""
        try:
            response = requests.get(f"{self.base_url}/api/services", timeout=10)
            if response.status_code != 200:
                return self.log_test("Specific Services Check", False, f"- Status: {response.status_code}")
            
            data = response.json()
            service_names = [s.get("name", "") for s in data]
            
            expected_services = ["Render", "Vercel", "OpenAI", "Anthropic", "MongoDB Atlas", "SendGrid"]
            missing_services = [s for s in expected_services if s not in service_names]
            
            if missing_services:
                return self.log_test("Specific Services Check", False, f"- Missing services: {missing_services}")
            
            return self.log_test("Specific Services Check", True, f"- All expected services found: {expected_services}")
            
        except Exception as e:
            return self.log_test("Specific Services Check", False, f"- Error: {str(e)}")

    def run_all_tests(self) -> bool:
        """Run all backend tests"""
        print("🚀 Starting SaaS Scout Backend API Tests")
        print(f"📍 Testing endpoint: {self.base_url}")
        print("=" * 60)
        
        # Run all tests
        tests = [
            self.test_root_endpoint,
            self.test_get_all_services,
            self.test_get_categories,
            self.test_get_cheapest,
            self.test_category_filtering,
            self.test_search_functionality,
            self.test_sorting_functionality,
            self.test_specific_services
        ]
        
        for test in tests:
            test()
            print()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests PASSED!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests FAILED")
            return False

def main():
    tester = SaaSScoutAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())