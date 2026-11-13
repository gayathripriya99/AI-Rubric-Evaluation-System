
from langchain_core.documents import Document


knowledge_documents = [

    Document(
        page_content="""
        FOOD SAFETY AND HYGIENE

        Food safety is essential in professional kitchen operations.

        Kitchen employees must wash their hands before handling food,
        after touching raw meat, after using the restroom, and after
        handling waste.

        Raw and cooked food must be stored separately to prevent
        cross contamination.

        Cutting boards and knives should be cleaned and sanitized
        between different food preparation activities.

        Perishable food must be maintained at safe temperatures.
        Refrigerated food should generally be kept at 5 degrees Celsius
        or below. Frozen food should be maintained at -18 degrees
        Celsius or below.

        Food handlers must wear clean uniforms and maintain personal
        hygiene.
        """,
        metadata={
            "chapter": "Food Safety",
            "topic": "Hygiene and Contamination",
            "source": "food_safety_manual"
        }
    ),

    Document(
        page_content="""
        KITCHEN OPERATIONS AND FIFO

        FIFO stands for First In, First Out.

        FIFO is an inventory management method in which older stock
        is used before newly received stock.

        Every food item should have a clear receiving date and
        expiration date.

        Kitchen employees should inspect inventory regularly.

        Proper storage, labeling, stock rotation, and temperature
        monitoring help reduce food waste and improve food quality.

        Kitchen workstations should remain clean and organized.
        """,
        metadata={
            "chapter": "Kitchen Operations",
            "topic": "Inventory Management",
            "source": "kitchen_operations_manual"
        }
    ),

    Document(
        page_content="""
        CUSTOMER SERVICE AND DINING EXPERIENCE

        Customer satisfaction is an important part of restaurant
        operations.

        Employees should greet customers politely and communicate
        clearly.

        Orders must be recorded accurately and communicated to
        kitchen staff.

        Customer complaints should be handled professionally.

        Staff should listen carefully, acknowledge the concern,
        apologize when appropriate, and provide a suitable solution.

        Clean dining areas and timely service contribute to a
        positive customer experience.
        """,
        metadata={
            "chapter": "Customer Service",
            "topic": "Dining Experience",
            "source": "service_manual"
        }
    ),

    Document(
        page_content="""
        INVENTORY AND LOGISTICS MANAGEMENT

        Effective inventory management ensures that ingredients
        and supplies are available when required.

        Restaurants should track stock levels, expiration dates,
        supplier deliveries, and consumption.

        Regular inventory audits help identify shortages,
        excess stock, and potential wastage.

        Perishable goods should be stored under appropriate
        temperature conditions.

        Accurate procurement planning helps control operating
        costs and maintain consistent food quality.
        """,
        metadata={
            "chapter": "Inventory Management",
            "topic": "Stock and Procurement",
            "source": "inventory_manual"
        }
    )
]


if __name__ == "__main__":
    print("Knowledge Base Loaded Successfully")
    print(f"Total Documents: {len(knowledge_documents)}")

    for document in knowledge_documents:
        print("\nChapter:", document.metadata["chapter"])
        print("Topic:", document.metadata["topic"])
