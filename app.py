from flask import Flask, render_template, request, jsonify
from datetime import datetime
from dateutil.relativedelta import relativedelta
import os

app = Flask(__name__)

def calculate_age(birth_date, current_date):
    try:
        birth = datetime.strptime(birth_date, "%Y-%m-%d")
        current = datetime.strptime(current_date, "%Y-%m-%d")
        
        # Validate dates
        if birth > current:
            return {"error": "Birth date cannot be after current date!"}
            
        # Calculate age using relativedelta
        diff = relativedelta(current, birth)
        years = diff.years
        months = diff.months
        days = diff.days
        
        # Total days for other unit conversions
        total_days = (current - birth).days
        
        # Convert to other units
        weeks = total_days // 7
        hours = total_days * 24
        minutes = hours * 60
        seconds = minutes * 60
        
        return {
            "years_months_days": f"{years} years, {months} months, {days} days",
            "months": f"{years * 12 + months} months, {days} days",
            "weeks": f"{weeks} weeks, {total_days % 7} days",
            "days": f"{total_days:,} days",
            "hours": f"{hours:,} hours",
            "minutes": f"{minutes:,} minutes",
            "seconds": f"{seconds:,} seconds",
            "birth_date": birth_date,
            "current_date": current_date,
            "total_seconds": seconds
        }
    except Exception as e:
        return {"error": f"Calculation error: {str(e)}"}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/calculate', methods=['POST'])
def api_calculate():
    data = request.json
    birth_date = data.get('birth_date')
    current_date = data.get('current_date')
    
    if not birth_date or not current_date:
        return jsonify({"error": "Both dates are required"}), 400
    
    result = calculate_age(birth_date, current_date)
    return jsonify(result)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
