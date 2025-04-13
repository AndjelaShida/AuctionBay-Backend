import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';


export function Match(
  type: any,
  property: (obj: any) => any,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedProperty] = args.constraints;
          const relatedValue = relatedProperty(args.object);

          return value === relatedValue;
        },
      },
    });
  };
}
